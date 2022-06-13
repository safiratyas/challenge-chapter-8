const ApplicationController = require('./ApplicationController');
const {
  EmailNotRegisteredError,
  InsufficientAccessError,
  RecordNotFoundError,
  WrongPasswordError,
  EmailAlreadyTakenError,
} = require('../errors');
const { JWT_SIGNATURE_KEY } = require('../../config/application');

class AuthenticationController extends ApplicationController {
  constructor({
    userModel,
    roleModel,
    bcrypt,
    jwt,
  }) {
    super();
    this.userModel = userModel;
    this.roleModel = roleModel;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
  }

  accessControl = {
    PUBLIC: 'PUBLIC',
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUSTOMER',
  };

  authorize = (rolename) => async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      const payload = await this.decodeToken(token);

      if (!!rolename && rolename !== payload.role.name) {
        throw new InsufficientAccessError(payload?.role?.name);
      }

      req.user = payload;
      next();
    } catch (err) {
      let details = null;
      if (err.details) {
        details = err.details;
      }
      res.status(401).json({
        error: {
          name: err.name,
          message: err.message,
          details,
        },
      });
    }
  };

  handleLogin = async (req, res, next) => {
    try {
      const email = req.body.email.toLowerCase();
      const { password } = req.body;
      const user = await this.userModel.findOne({
        where: { email },
        include: [{ model: this.roleModel, attributes: ['id', 'name'] }],
      });

      if (!user) {
        const err = new EmailNotRegisteredError(email);
        res.status(404).json(err);
        return;
      }

      const isPasswordCorrect = await this.verifyPassword(password, user.encryptedPassword);

      if (!isPasswordCorrect) {
        const err = new WrongPasswordError();
        res.status(401).json(err);
        return;
      }

      const accessToken = await this.createTokenFromUser(user, user.Role);

      res.status(200).json({
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  };

  handleRegister = async (req, res, next) => {
    try {
      const { name } = req.body;
      const email = req.body.email.toLowerCase();
      const { password } = req.body;
      const existingUser = await this.userModel.findOne({ where: { email } });

      if (existingUser) {
        const err = new EmailAlreadyTakenError(email);
        res.status(422).json(err);
        return;
      }

      const role = await this.roleModel.findOne({
        where: { name: this.accessControl.CUSTOMER },
      });

      const user = await this.userModel.create({
        name,
        email,
        encryptedPassword: await this.encryptPassword(password),
        roleId: role.id,
      });

      const accessToken = await this.createTokenFromUser(user, role);

      res.status(201).json({
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  };

  handleGetUser = async (req, res) => {
    const user = await this.userModel.findByPk(req.user.id);
    if (!user) {
      const err = new RecordNotFoundError(user.name);
      res.status(404).json(err);
      return;
    }

    const role = await this.roleModel.findByPk(user.roleId);

    if (!role) {
      const err = new RecordNotFoundError(role.name);
      res.status(404).json(err);
      return;
    }

    res.status(200).json(user);
  };

  async createTokenFromUser(user, role) {
      // eslint-disable-next-line no-return-await
      return await this.jwt.sign({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: {
        id: role.id,
        name: role.name,
      },
    }, process.env.JWT_SIGNATURE_KEY);
  }

  async decodeToken(token) {
    // eslint-disable-next-line no-return-await
    return await this.jwt.verify(token, process.env.JWT_SIGNATURE_KEY);
  }

  async encryptPassword(password) {
    // eslint-disable-next-line no-return-await
    return await this.bcrypt.hashSync(password, 10);
  }

  async verifyPassword(password, encryptedPassword) {
    // eslint-disable-next-line no-return-await
    return await this.bcrypt.compareSync(password, encryptedPassword);
  }
}

module.exports = AuthenticationController;
