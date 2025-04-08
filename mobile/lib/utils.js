import { format } from 'date-fns';

const manualParse = (dateString) => {
 
  const parsed = Date.parse(dateString);
  return new Date(parsed);
};

export const formatMongoDate = (mongoDate) => {

  mongoDate = manualParse(mongoDate);
  

  return mongoDate instanceof Date && !isNaN(mongoDate)
    ? format(mongoDate, 'd.M.yyyy')
    : "Invalid date";
};