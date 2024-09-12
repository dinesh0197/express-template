export const GenResObj = (
  code: number,
  success: boolean,
  message: string,
  data?: any
) => {
  return {
    code,
    data: {
      success,
      message,
      data: data || null,
    },
  };
};
