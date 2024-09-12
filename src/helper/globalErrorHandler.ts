import { NextFunction, Request, Response } from "express";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(`Error in ${req.method} ${req.url}`, err.stack);
    res.status(500).send({status: false, message:'Something broke!', data: null});
};

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
    res.status(404).send({status: false, message: 'Not found', data: null});
};
  
process
    .on('unhandledRejection', (reason: any, promise: Promise<any>) => {
        console.error('Unhandled Rejection:', reason);
    })
    .on('uncaughtException', (err: Error, origin: string) => {
        console.error('Uncaught Exception:', err);
        process.exit(1);
    });