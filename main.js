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

  increment = () => {
    const newVal =
      this.node.value != "" ? Number(this.node.value) + 1 : this.node.min;
    if (newVal <= this.node.max) {
      this.node.value = newVal;
      this.subscriptions.forEach(([_listeners, callback]) => callback());
    }
  };

  decrement = () => {
    if (this.node.value != "" && this.node.value != this.node.min) {
      this.node.value = Number(this.node.value) - 1;
    }
    this.subscriptions.forEach(([_listeners, callback]) => callback());
  };

  subscribeToUpdates = (callback) => {
    this.subscriptions.push([
      [
        this.node.addEventListener("keyup", callback),
        this.node.addEventListener("change", callback),
      ],
      callback,
    ]);
  };

  restrictToNumberInput = () => {
    this.node.onkeydown = (e) => {
      e.target.setAttribute("type", "text");
      const asciiVal = e.key.charCodeAt(0);
      const isSpecialKeyPressed =
        e.ctrlKey ||
        e.key === "Backspace" ||
        e.key === "Tab" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight";
      const isNumber = asciiVal >= 48 && asciiVal <= 58;
      const isDecimal = asciiVal == 46 && this.node.value.length > 0;
      const doesExceedMax = Number(this.node.value + e.key) > this.node.max;
      const isSelected = e.target.selectionEnd - e.target.selectionStart;

      if (!isNumber && !isDecimal && !isSpecialKeyPressed) {
        e.preventDefault();
      } else if (doesExceedMax && !isSelected) {
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
  const decrementTipBtn = document.getElementById("decrementTip");
  const incrementTipBtn = document.getElementById("incrementTip");
  const incrementPersonCountBtn = document.getElementById("incrementCount");
  const decrementPersonCountBtn = document.getElementById("decrementCount");

  // Updates the text of tips per person and total bill per person with new
  // value obtained from calculateTip function and if any of the field is not
  // valid value we show 0 in both tips per person and total bill by default
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

  // Subscribe to any changes made in any of the input so that new total bill
  // and tips per person can be calculated
  billInput.subscribeToUpdates(updateData);
  tipInput.subscribeToUpdates(updateData);
  personCountInput.subscribeToUpdates(updateData);

  decrementPersonCountBtn.onclick = personCountInput.decrement;
  incrementPersonCountBtn.onclick = personCountInput.increment;

  decrementTipBtn.onclick = tipInput.decrement;
  incrementTipBtn.onclick = tipInput.increment;

  // Initial call to handle case where the inputs are remembered on reload
  updateData();
};
