import {use as passportUse, deserializeUser, serializeUser} from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {OAuth2Strategy as GoogleStrategy} from 'passport-google-oauth';
import {User} from '../db/schemas/users';
import {config as getConfig} from './index';
import {error as werr} from 'winston';

let config = getConfig();

// Passport configuration
serializeUser((user, done) => {
    done(null, user.id);
});
deserializeUser((id, done) => {
    User.findOne({ _id: id })
        .select('username')
        .exec(done);
});

// Local Strategy
passportUse(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {
        User.findOne({ username })
        .select('username email hashed_password salt')
        .exec((err, user) => {
            if (err) return done(err);
            let errorObject = { message: 'wrong username or password' };
            if (!user) {
                return done(null, false, errorObject);
            }
            user.authenticate(password)
                .then(res => {
                    if (res) {
                        done(null, user);
                    } else {
                        done(null, false, errorObject);
                    }
                });

        });
}));

// Google Strategy
passportUse(new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL
    },
    (_accessToken, _refreshToken, profile, done) => {
        User.findOne({ 'google.id': profile.id })
        .select('username')
        .exec((err, user) => {
            if (err) return done(err);
            if (!user) {
                user = new User({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    provider: 'google',
                    google: profile._json
                });
                user.save((error) => {
                    if (error) werr(error);
                    return done(error, user);
                });
            } else {
                return done(null, user);
            }
        });
}));
// Github Strategy
//
// TODO
