export const generateErrorMessage = (error: any) => {
    if(typeof error === "string" || error instanceof String){
        return error.toString();
    }
    let msg = "Something went wrong";
    try {
        const errorMessage = error.message || error;
        // Try to parse the error message if it's a JSON string
        if (typeof errorMessage === "string") {
            const parsed = JSON.parse(errorMessage);
            msg = parsed.message || parsed.error || errorMessage;
        } else if (errorMessage.message) {
            msg = errorMessage.message;
        } else {
            msg = errorMessage.toString();
        }
    } catch (e) {
        // If parsing fails, try to extract message from the raw error
        if (error.message) {
            msg = error.message;
        }
    }
    return msg;
};