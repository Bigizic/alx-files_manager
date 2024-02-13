#!/usr/bin/node

export const splitAuthHeader = (header) => {
  const splitter = header.split(' ');
  if (splitter[0] !== 'Basic') { return null; }

  return splitter[1];
};

export const getParams = (string) => {
  const [email, password] = string.split(':');
  if (!email || !password) {
    return null;
  }
  return [email, password];
};
