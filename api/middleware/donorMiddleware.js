import { Decimal } from '@prisma/client/runtime/library';

// 处理捐赠者数据格式化
export const processDonorData = (req, res, next) => {
  try {
    const donorData = {
      ...req.body,
      total_donation_amount: req.body.total_donation_amount 
        ? new Decimal(req.body.total_donation_amount) 
        : new Decimal(0),
      total_pledge: req.body.total_pledge 
        ? new Decimal(req.body.total_pledge) 
        : null,
      largest_gift_amount: req.body.largest_gift_amount 
        ? new Decimal(req.body.largest_gift_amount) 
        : null,
      last_gift_amount: req.body.last_gift_amount 
        ? new Decimal(req.body.last_gift_amount) 
        : null,
    };
    
    req.processedData = donorData;
    next();
  } catch (error) {
    next(error);
  }
}; 