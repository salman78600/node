class ApiResponse{
    constructor(status, data, message){
        this.status = status;
        this.data = data || null;
        this.message = message;
        this.success = status < 400;
    }
}