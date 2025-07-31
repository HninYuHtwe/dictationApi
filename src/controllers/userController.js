const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { validateInput } = require('../utils/validation');
const objUser = new User();

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required!' });
    }
    const user = await objUser.model.findOne({ email });
    if (user && (await bcrypt.compareSync(password, user.password))) {
      const userInfo = {
        username: user.username,
        email: user.email,
        role: user.role,
      };
      const accessToken = jwt.sign(
        {
          user: {
            username: user.username,
            email: user.email,
            id: user._id,
          },
        },
        process.env.JWT_SYSADMIN_SECRET,
        { expiresIn: '1h' }
      );
      return res.status(200).json({ accessToken, userInfo });
    }
    return res.status(400).json({ message: 'Email or Password is incorrect!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { username, roleId, email } = req.query;
    const filters = {};
    filters.deletedAt = null;
    if (username) {
      filters.username = {
        $regex: username,
        $options: 'i',
      };
    }

    if (email) {
      filters.email = { $regex: email };
    }

    const users = await objUser.model
      .find(filters)
      .select('_id username displayName email role');
    res.status(200).json({
      status: 1,
      message: 'All Users',
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await objUser.model
      .findOne({ _id: userId, deletedAt: null })
      .select('username displayName email role');
    res.status(200).json({
      status: 1,
      message: 'User Details',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const { errorMsg, isValid } = validateInputFields(userData);

    if (!isValid) {
      return res.status(400).json({
        status: 0,
        message: errorMsg,
      });
    }

    const { errs, isValidData } = await validateData(userData);

    if (!isValidData) {
      return res.status(400).json(errs);
    }

    const userExist = await objUser.model.findOne({ email: userData.email });
    if (userExist) {
      return res
        .status(400)
        .json({ message: 'This Email already registered!' });
    }
    const hashPassword = await bcrypt.hashSync(
      userData.password,
      bcrypt.genSaltSync(10)
    );
    userData.password = hashPassword;
    const userId = await objUser.createEntry(userData);
    res.status(200).json({
      status: 1,
      message: 'User Created Successfully!',
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const id = req.params.id;
    const { errorMsg, isValid } = validateInputFields(userData, id);

    if (!isValid) {
      return res.status(400).json({
        status: 0,
        message: errorMsg,
      });
    }

    const { errs, isValidData } = await validateData(userData);

    if (!isValidData) {
      return res.status(400).json(errs);
    }

    const updateUser = await objUser.updateEntry(id, userData);

    res.status(200).json({
      status: 1,
      message: 'User Updated Successfully!',
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await objUser.softDelete(req.params.id);
    res.status(200).json({
      status: 1,
      message: 'User Deleted Successfully!',
    });
  } catch (err) {
    next(err);
  }
};

const validateInputFields = (data, id = null) => {
  const requiredFields = [
    'username',
    'displayName',
    'email',
    'role',
    ...(id === null ? ['password'] : []),
  ];

  return validateInput(data, requiredFields);
};

const validateData = async (data) => {
  const errs = [];
  if (data.roleId) {
    const role = await objRole.model.findOne({
      _id: data.roleId,
      deletedAt: null,
    });
    if (!role) errs.push('This Role did not have in System');
  }

  return {
    isValidData: errs.length === 0,
    errs,
  };
};
