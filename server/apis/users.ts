import {User} from '../db/schemas/users';
import {app} from '../config/express';
import {reqAdmin} from './middlewares';
import {logRequest} from '../logger/helpers';
import {errorToJson} from '../db/error_helpers';

app.post('/api/users', reqAdmin, logRequest('tries to add a user.'),
    (req, res) => {
        var user = new User(req.body);
        user.provider = 'local';
        user.save((err) => {
            if (err) {
                return res.status(400).json(errorToJson(err));
            }

            // manually login the user once successfully signed up
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).json(err);
                }
                res.sendStatus(200);
            });
        });
});
