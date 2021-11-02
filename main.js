import "./style.css";

window.onload = () => {
  const bill = document.getElementById("bill");
  const tip = document.getElementById("tip");
  const peopleCount = document.getElementById("count");
  const perPersonTip = document.getElementById("perPersonTip");
  const totalPerPerson = document.getElementById("totalPerPerson");

  const calculateTip = () => {
    if (bill.value && tip.value && peopleCount.value) {
      const newTotalTip = (bill.value * tip.value) / 100;
      const newPerPersonTip =
        peopleCount.value != 0 ? newTotalTip / peopleCount.value : 0;
      const newTotalPerPerson =
        newPerPersonTip != "0"
          ? bill.value / peopleCount.value + newPerPersonTip
          : 0;

      perPersonTip.innerText = newPerPersonTip.toFixed(2);
      totalPerPerson.innerText = newTotalPerPerson.toFixed(2);
    } else {
      perPersonTip.innerText = 0;
      totalPerPerson.innerText = 0;
    }
  };

  bill.addEventListener("keyup", calculateTip);
  tip.addEventListener("keyup", calculateTip);
  peopleCount.addEventListener("keyup", calculateTip);

  calculateTip();
};
