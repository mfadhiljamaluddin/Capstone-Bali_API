import { connection, query } from '../../services/connDB.js';
import validateToken from '../../middleware/Jwt-Token.js';

const AddDestination = async (req, res) => {
  const { customAlphabet } = await import('nanoid');
  const { name_dest, description, img, location } = req.payload;
  const generateId = customAlphabet(
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    10,
  );
  const dest_id = generateId();
  const { authorization } = req.headers;

  if (!authorization) {
    const responseData = res.response({
      status: 'fail',
      message: 'missing authentication token',
    });
    responseData.code(401);
    return responseData;
  }
  if (!name_dest || !description || !img || !location) {
    const response = res.response({
      status: 'fail',
      message: 'Please fill all the fields',
    });
    response.code(400);
    return response;
  }

  const token = authorization.split(' ')[1];
  const decoded = validateToken(token);
  if (!decoded) {
    const responseData = res.response({
      status: 'fail',
      message: 'invalid authentication token or token Expired',
    });
    responseData.code(401);
    return responseData;
  }
  try {
    const queryDataDest = `SELECT * FROM destination WHERE name_dest = ?`;
    const Data_Dest = await query(queryDataDest, [name_dest]);
    if (Data_Dest.length > 0) {
      const response = res.response({
        status: 'fail',
        message: 'Destination Already Exist',
      });
      response.code(400);
      return response;
    }
    const queryData = `INSERT INTO destination (dest_id,name_dest,description,img,location) VALUES (?,?,?,?,?)`;
    await query(queryData, [dest_id, name_dest, description, img, location]);

    const response = res.response({
      status: 'success',
      message: 'Success Created Destination',
      data: {
        dest_id,
        name_dest,
        description,
        img,
        location,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error(error.message);
    const response = res.response({
      status: 'fail',
      message: 'Fail Created Destination',
    });
    response.code(500);
    return response;
  }
};

export default AddDestination;