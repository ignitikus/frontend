import React, { useEffect, useState } from "react";
import axios from "axios";
import { failureToast, successToast } from "../Toaster/Toast";

import "./Database.css";

export default function Database() {
  const [inputField, setInputField] = useState("");
  const [tableNames, setTableNames] = useState([]);
  const [tableData, setTableData] = useState([]);

  const getInfo = async () => {
    try {
      const {
        data: { tables_in_db_project: tables },
      } = await axios.get(
        "https://niko-flask-mysql.herokuapp.com/mysql/PROJECT"
      );

      const results = await axios.all(
        tables.map(
          async (table) =>
            await axios.get(
              `https://niko-flask-mysql.herokuapp.com/mysql/PROJECT/\`${table}\`/`
            )
        )
      );

      const data = results.map(({ data }) => data);
      console.log(data);
      setTableNames(data.map((entry) => Object.keys(entry)[0].split("`")[1]));
      setTableData(data.map((entry) => Object.values(entry)[0]));
    } catch (error) {
      failureToast(error.message);
      console.log(error.message);
    }
  };

  useEffect(() => {
    getInfo();
  }, []);

  const submitQuery = async () => {
    try {
      const request = inputField.split(" ").join("%20");
      const result = await axios.get(
        `https://niko-flask-mysql.herokuapp.com/mysql/post/${request}/`
        // `http://localhost:5000/mysql/post/${request}/`
      );
      successToast(`Query: ${result.data} executed`);
      console.log(result.data);
      setInputField("");
      getInfo();
    } catch (error) {
      failureToast(error.response.data);
      console.log("Error", error.response.data);
    }
  };

  const handleOnKeyDown = (e) => {
    if (e.keyCode === 13) {
      submitQuery();
    }
  };

  return (
    <div>
      <div className="command-input">
        <label>mysql></label>
        <input
          onKeyDown={handleOnKeyDown}
          onChange={(e) => setInputField(e.target.value)}
          value={inputField}
        ></input>
        <label onClick={() => setInputField("")} className="x-button">
          x
        </label>
      </div>
      <h2>Team Savory Salamanders</h2>
      {tableData.map((entry, i) => (
        <div className="tables-div" key={i}>
          <label>{tableNames[i]}</label>
          <table>
            <thead>
              <tr>
                {Object.keys(entry[0]).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entry.map((data, i) => (
                <tr key={i}>
                  {Object.values(data).map((piece, i) => {
                    if (`${piece}`.includes("password")) {
                      return <td key={piece + i}>**********</td>;
                    }
                    return <td key={piece + i}>{piece}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
