const uniqueMessage = error => {
  let output;
  try {
    let fieldName = error.message.substring(
      error.message.lastIndexOf('.$') + 2,
      error.message.lastIndexOf('_1')
    );
    output =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + 'already exists';
  } catch (err) {
    output = 'Resource Already exists';
  }

  return output;
};

exports.errorHandler = error => {
  let message = '';

  if (error.name === 'CastError') {
    message = `Resource not found ${error.value}`;
  }

  if (error.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message);
  }

  if (error.code) {
    switch (error.code) {
      case 11000:
      case 11001:
        message = uniqueMessage(error);
        break;
      default:
        message = 'something went wrong';
    }
  } else {
    for (let errorName in error.errors) {
      if (error.errorors[errorName].message) {
        message = error.errorors[errorName].message;
      }
    }
  }

  return message;
};
