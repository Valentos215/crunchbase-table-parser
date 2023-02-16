const wrapper = document.createElement("div");
wrapper.classList.add("wrapper");
document.body.append(wrapper);

const button = document.createElement("button");
button.classList.add("button");
button.innerText = "Copy table to clipboard";
wrapper.append(button);
button.addEventListener("click", obButtonClick);

const message = document.createElement("div");
message.classList.add("message");

const showMessage = (messageText) => {
  message.innerText = messageText;
  wrapper.append(message);
  setTimeout(() => {
    message.remove();
    button.addEventListener("click", obButtonClick);
  }, 2000);
};

const childrenParser = (nodes, arr) => {
  Array.prototype.forEach.call(nodes, (node) => {
    const multiField = node.querySelector(".field-type-identifier-multi");

    // if multiple elements in one table cell
    if (multiField) {
      const itemsArr = [];
      Array.prototype.forEach.call(multiField.children, (item) => {
        itemsArr.push(item.innerText);
      });
      arr.push(itemsArr.join(","));
      return;
    }

    // if node contains other children
    if (node.children.length) {
      childrenParser(node.children, arr);

      // if node contains no other children
    } else if (node.innerText) {
      // pushing inner text of a node into an array
      arr.push(node.innerText);
    }
  });
};

function obButtonClick() {
  button.removeEventListener("click", obButtonClick);
  const headers = document.querySelectorAll("grid-column-header");
  const rows = document.querySelectorAll("grid-row");
  let tableArr = [];

  (function getTableHeaders() {
    let tableHeaders = [];
    childrenParser(headers, tableHeaders);
    if (tableHeaders.length) {
      tableHeaders = ["#", ...tableHeaders.slice(1, -1)]; // replace the empty cell at the beginning with the symbol "#"
      tableArr.push(tableHeaders);
    }
  })();

  (function getTableValues() {
    const tableValues = [];
    Array.prototype.forEach.call(rows, (row) => {
      const values = [];
      childrenParser(row.children, values);
      tableValues.push(values.slice(1));
    });
    tableArr = [...tableArr, ...tableValues];
  })();

  (function copyTableToBuffer() {
    let table = "";
    if (tableArr.length) {
      tableArr.forEach((row) => {
        table = table + row.join("\t").trim() + "\n"; //add tabulation and paragraphs between cells
      });
      navigator.clipboard
        .writeText(table)
        .then(() => showMessage("Table copied successfully"))
        .catch(() => showMessage("Some error happened"));
    } else {
      showMessage("There are no tables on this page");
    }
  })();
}
