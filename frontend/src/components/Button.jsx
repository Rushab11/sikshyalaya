import React from "react";
import "./statics/css/button.css";

const Button = ({ children, name, addStyles, onClicked, ...rest }) => {
  return (
    <button
      id={name}
      className={"main_button " + addStyles}
      onClick={onClicked}
      {...rest}
    >
      {name}
    </button>
  );
};

export default Button;
