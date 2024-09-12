export type TGenResObj = {
  success: boolean;
  message: string;
  data?: any;
};

export type TResponse = {
    code: number;
    data: TGenResObj;
  };