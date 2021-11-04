import "./style.css";

// Class for the number inputs bill, tip and person count
class NumberInput {
  // Ref to the node of the input
  node;
  // Array container to keep track of all listeners on the node
  subscriptions = [];

  constructor(id = "", onlyInteger = false) {
    this.node = document.getElementById(id);

    if (this.node != undefined) {
      this.restrictToNumberInputAndValidate(onlyInteger);
    } else {
      throw new Error("Id must be valid");
    }
  }

  // Getter function for the input
  getValue = () => {
    return Number(this.node.value);
  };

  // Setter function for the input
  setValue = (newValue) => {
    this.node.value = Number(newValue);
  };

  // Increments the value and extends its effect to all subscriptions
  increment = () => {
    const newVal =
      this.node.value != "" ? Number(this.node.value) + 1 : this.node.min;
    if (newVal <= this.node.max) {
      this.node.value = newVal;
      this.subscriptions.forEach(([_listeners, callback]) => callback());
    }
  };

  // Decrements the value and extends its effect to all subscriptions
  decrement = () => {
    if (this.node.value != "" && this.node.value - 1 >= this.node.min) {
      this.node.value = Number(this.node.value) - 1;
    }
    this.subscriptions.forEach(([_listeners, callback]) => callback());
  };

  // Add callbacks to be called whenever the value of the input changes
  subscribeToUpdates = (callback) => {
    this.subscriptions.push([
      [
        this.node.addEventListener("keyup", callback),
        this.node.addEventListener("change", callback),
      ],
      callback,
    ]);
  };

  // Restricts the input value to numbers and special keys only and validates
  // whether the input is within min and max ranges
  restrictToNumberInputAndValidate = (onlyInteger) => {
    this.node.onkeydown = (e) => {
      const asciiVal = e.key.charCodeAt(0);
      const isSpecialKeyPressed =
        e.ctrlKey ||
        [
          "Backspace",
          "Tab",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].some((key) => key === e.key);
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

// Class for the tip calculator, contains NumberInput class objects as members
// and methods to calculate new output and update it on the page
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

  // Calculate new tips and update it on the calculator output
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

  // Attach onclick functions to +, - buttons of tip and person count inputs
  decrementTipBtn.onclick = tipInput.decrement;
  incrementTipBtn.onclick = tipInput.increment;
  decrementPersonCountBtn.onclick = personCountInput.decrement;
  incrementPersonCountBtn.onclick = personCountInput.increment;

  // Initial call to handle case where the inputs are remembered on reload
  calculator.updateData();
};
