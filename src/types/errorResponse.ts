export type ErrorResponse = {
    data?: {
        message?: string;
        title?: string;
        errors?: string[];
    };
};