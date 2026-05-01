import { ZodError } from 'zod';

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            req.validatedData = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const issues = error.issues || error.errors || [];
                const messages = issues.map(e => {
                    const path = e.path?.length ? `${e.path.join('.')}: ` : '';
                    return `${path}${e.message}`;
                }).join('; ');

                return res.status(400).json({ message: `Validation error: ${messages}` });
            }
            return res.status(400).json({ message: 'Invalid request body' });
        }
    };
};
