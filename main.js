import "./style.css";
class NumberInput {
  node;
  subscriptions = [];

  constructor(id = "") {
    this.node = document.getElementById(id);

    if (this.node != undefined) {
      this.restrictToNumberInput();
    } else {
      throw new Error("Id must be valid");
    }
  }

  getValue = () => {
    return this.node.value;
  };

  setValue = (newValue) => {
    this.node.value = Number(newValue);
  };

  subscribeToUpdates = (callback) => {
    this.subscriptions.push([
      this.node.addEventListener("keyup", callback),
      callback,
    ]);
    this.subscriptions.push([
      this.node.addEventListener("change", callback),
      callback,
    ]);
  };

  unsubscribeAllUpdates = () => {
    this.subscriptions.map(([subscription, callback]) =>
      this.node.removeEventListener(subscriptiolon, callback)
    );
  };

  restrictToNumberInput = () => {
    this.node.onkeydown = (e) => {
      const asciiVal = e.key.charCodeAt(0);
      const isSpecialKeyPressed =
        e.ctrlKey ||
        e.key === "Backspace" ||
        e.key === "Tab" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight";
      const isNumber = asciiVal >= 48 && asciiVal <= 58;
      const isDecimal = asciiVal == 46 && this.node.value.length > 0;

      if (!isNumber && !isDecimal && !isSpecialKeyPressed) {
        e.preventDefault();
      }
    };
  };
}

const calculateTip = (bill, tip, peopleCount) => {
  const newTotalTip = (bill * tip) / 100;
  const newTipPerPerson = newTotalTip / peopleCount;
  const newTotalPerPerson = bill / peopleCount + newTipPerPerson;
  return { tipPerPerson: newTipPerPerson, totalPerPerson: newTotalPerPerson };
};

window.onload = () => {
  const billInput = new NumberInput("bill");
  const tipInput = new NumberInput("tip");
  const personCountInput = new NumberInput("count");

  const perPersonTipNode = document.getElementById("perPersonTip");
  const totalPerPersonNode = document.getElementById("totalPerPerson");

  function updateData() {
    const bill = billInput.getValue();
    const tip = tipInput.getValue();
    const personCount = personCountInput.getValue();

    if (bill && tip != "" && personCount) {
      const { tipPerPerson, totalPerPerson } = calculateTip(
        bill,
        tip,
        personCount
      );
      perPersonTipNode.innerText = tipPerPerson.toFixed(2);
      totalPerPersonNode.innerText = totalPerPerson.toFixed(2);
    } else {
      perPersonTipNode.innerText = Number(0).toFixed(2);
      totalPerPersonNode.innerText = Number(0).toFixed(2);
    }
  }

  billInput.subscribeToUpdates(updateData);
  tipInput.subscribeToUpdates(updateData);
  personCountInput.subscribeToUpdates(updateData);

  updateData();
};
