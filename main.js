import "./style.css";

class NumberInput {
  node;
  subscriptions = [];

  constructor(id = "", onlyInteger = false) {
    this.node = document.getElementById(id);

    if (this.node != undefined) {
      this.restrictToNumberInputAndValidate(onlyInteger);
    } else {
      throw new Error("Id must be valid");
    }
  }

  getValue = () => {
    return Number(this.node.value);
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
    if (this.node.value != "" && this.node.value - 1 >= this.node.min) {
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

  restrictToNumberInputAndValidate = (onlyInteger) => {
    this.node.onkeydown = (e) => {
      e.target.setAttribute("type", "text");
      const asciiVal = e.key.charCodeAt(0);
      const isSpecialKeyPressed =
        e.ctrlKey ||
        e.key === "Backspace" ||
        e.key === "Tab" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Home" ||
        e.key === "End";
      const isNumber = asciiVal >= 48 && asciiVal <= 58;
      const isDecimal = asciiVal == 46 && /^\d+$/.test(this.node.value);
      const doesExceedMax = Number(this.node.value + e.key) > this.node.max;
      const isSelected = e.target.selectionEnd - e.target.selectionStart;

      if (!isNumber && (onlyInteger || !isDecimal) && !isSpecialKeyPressed) {
        e.preventDefault();
      } else if (doesExceedMax && !isSelected) {
        e.preventDefault();
      }
    };
  };
}

class TipCalculator {
  perPersonTipNode;
  totalPerPersonNode;
  billInput;
  tipInput;
  personCountInput;

  constructor({
    billInputObj,
    tipInputObj,
    personCountInputObj,
    perPersonTipId = "",
    totalPerPersonId = "",
  }) {
    if (billInputObj && tipInputObj && personCountInputObj) {
      this.billInput = billInputObj;
      this.tipInput = tipInputObj;
      this.personCountInput = personCountInputObj;
    } else {
      throw new Error("Input objects must be valid object of type NumberInput");
    }
    this.perPersonTipNode = document.getElementById(perPersonTipId);
    this.totalPerPersonNode = document.getElementById(totalPerPersonId);
  }

  updateData = () => {
    const bill = this.billInput.getValue();
    const tip = this.tipInput.getValue();
    const personCount = this.personCountInput.getValue();

    let tipPerPerson, totalPerPerson;

    if (bill && tip != "" && personCount) {
      const newTotalTip = (bill * tip) / 100;
      tipPerPerson = newTotalTip / personCount;
      totalPerPerson = bill / personCount + tipPerPerson;
    } else {
      tipPerPerson = 0;
      totalPerPerson = 0;
    }

    this.perPersonTipNode.innerText = tipPerPerson.toFixed(2);
    this.totalPerPersonNode.innerText = totalPerPerson.toFixed(2);
  };
}

window.onload = () => {
  const billInput = new NumberInput("bill");
  const tipInput = new NumberInput("tip");
  const personCountInput = new NumberInput("count", true);
  const calculator = new TipCalculator({
    billInputObj: billInput,
    tipInputObj: tipInput,
    personCountInputObj: personCountInput,
    perPersonTipId: "perPersonTip",
    totalPerPersonId: "totalPerPerson",
  });

  // Subscribe to any changes made in any of the input so that new total bill
  // and tips per person can be calculated
  billInput.subscribeToUpdates(calculator.updateData);
  tipInput.subscribeToUpdates(calculator.updateData);
  personCountInput.subscribeToUpdates(calculator.updateData);

  const decrementTipBtn = document.getElementById("decrementTip");
  const incrementTipBtn = document.getElementById("incrementTip");
  const incrementPersonCountBtn = document.getElementById("incrementCount");
  const decrementPersonCountBtn = document.getElementById("decrementCount");

  decrementTipBtn.onclick = tipInput.decrement;
  incrementTipBtn.onclick = tipInput.increment;
  decrementPersonCountBtn.onclick = personCountInput.decrement;
  incrementPersonCountBtn.onclick = personCountInput.increment;

  // Initial call to handle case where the inputs are remembered on reload
  calculator.updateData();
};
