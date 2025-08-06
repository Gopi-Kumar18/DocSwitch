import { fileTypeFromFile } from 'file-type';

const type = await fileTypeFromFile("C:/Users/gptz1/Downloads/Docker_All_In_One_CMD_Doc_ddbea2cf (1).png");
console.log(type.mime); 
