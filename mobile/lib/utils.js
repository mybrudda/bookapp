import { format } from 'date-fns';

export const formatMongoDate = (mongoDate) => {
  if (!(mongoDate instanceof Date)) {
    mongoDate = new Date(mongoDate); 
  }
  return format(mongoDate, 'd.M.yyyy');
};