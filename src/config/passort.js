import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { admin } from '../mongo/models';

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.WEB_SECRET;

const passportConfig = function (passport) {
    passport.use(new JwtStrategy(opts,
        (payload, done) => {
            admin.findById(payload.id)
                .then((foundAdmin) => {
                    if (foundAdmin) {
                        return done(null, foundAdmin);
                    }
                    return done(null, false);
                })
                .catch((err) => {
                    return done(err);
                });
        }
    ));
};

export {
    passportConfig,
}