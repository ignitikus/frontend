import React, { useEffect, useState } from "react";
import axios from "axios";

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
        "https://niko-flask-mysql.herokuapp.com/mysql/db_project/"
      );

      const results = await axios.all(
        tables.map(
          async (table) =>
            await axios.get(
              `https://niko-flask-mysql.herokuapp.com/mysql/db_project/\`${table}\`/`
            )
        )
      );

      const data = results.map(({ data }) => data);

      setTableNames(data.map((entry) => Object.keys(entry)[0].split("`")[1]));
      setTableData(data.map((entry) => Object.values(entry)[0]));
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getInfo();
  }, []);

  const handleOnClick = async () => {
    const request = inputField.split(" ").join("%20");
    const result = await axios.get(
      `https://niko-flask-mysql.herokuapp.com/mysql/post/${request}/`
    );
  };

  return (
    <div>
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
                  {Object.values(data).map((piece, i) => (
                    <td key={piece + i}>{piece}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
