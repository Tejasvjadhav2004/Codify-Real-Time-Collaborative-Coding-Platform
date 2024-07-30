import jwt from 'jsonwebtoken';
const { verify } = jwt;

const validateToken = (req, res, next) => {
    const accessToken = req.header("accessToken");
    if (!accessToken) {
        return res.json({ error: 'User not logged in!' });
    }

    try {
        const validToken = verify(accessToken, 'mySecret');

        if (validToken) {
            req.user = validToken; // Attach the decoded token to the request object
            return next();
        }
    } catch (err) {
        return res.json({ error: 'Invalid token!' });
    }
}

export default validateToken;
