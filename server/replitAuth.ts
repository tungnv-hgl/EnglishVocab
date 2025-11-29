import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import MemoryStore from "memorystore";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const isProduction = process.env.NODE_ENV === "production";

  // For development, use in-memory store
  if (!isProduction) {
    const memStore = new (MemoryStore(session))({ checkPeriod: 86400000 });
    return session({
      secret: process.env.SESSION_SECRET!,
      store: memStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: false,
        secure: false,
        maxAge: sessionTtl,
      },
    });
  }

  // For production, use PostgreSQL store
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(profile: any) {
  await storage.upsertUser({
    id: `google_${profile.id}`,
    email: profile.emails?.[0]?.value || profile.email,
    firstName: profile.given_name || profile.name?.givenName || "",
    lastName: profile.family_name || profile.name?.familyName || "",
    profileImageUrl: profile.photos?.[0]?.value || profile.picture,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);

  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/callback";

  // For development, allow starting without credentials
  if (!clientID || !clientSecret) {
    console.warn(
      "⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable login.\n" +
      "See replit.md for setup instructions."
    );
    
    // Add dummy routes that show an error
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());
    
    passport.serializeUser((user: any, done) => done(null, user));
    passport.deserializeUser((user: any, done) => done(null, user));

    app.get("/api/login", (req, res) => {
      res.status(503).json({
        error: "Google OAuth not configured",
        message: "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables",
      });
    });

    app.get("/api/logout", (req, res) => {
      res.redirect("/");
    });

    return;
  }

  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          await upsertUser(profile);
          const user = await storage.getUser(`google_${profile.id}`);
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user?.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Google OAuth routes
  app.get(
    "/api/login",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get(
    "/api/callback",
    passport.authenticate("google", {
      successRedirect: "/",
      failureRedirect: "/login",
    })
  );

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
