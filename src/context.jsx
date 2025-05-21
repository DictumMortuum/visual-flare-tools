import React, { createContext } from 'react';
export const UserContext = createContext(null);

const getUser = () => {
  const raw = localStorage.getItem("user");

  if (raw === null) {
    return {
      email: null,
      user_id: null,
    }
  } else {
    return JSON.parse(raw);
  }
}

const reducer = (state, action) => {
  switch (action.type) {

    case "user::set": {
      localStorage.setItem("user", JSON.stringify(action.user));

      return {
        ...state,
        user: action.user,
      }
    }

    case "user::unset": {
      localStorage.removeItem("user");

      return {
        ...state,
        user: {
          email: null,
          user_id: null,
        },
      }
    }

    default: {
      return {
        ...state,
      }
    }
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, {
    user: getUser(),
  });

  return (
    <UserContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </UserContext.Provider>
  );
}
