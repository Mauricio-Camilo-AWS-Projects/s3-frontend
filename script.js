// Backend URL
const API_BASE_URL = "http://54.162.141.128:3000";

let latestSimulation = null;
let savedSimulations = [];

async function calculateInterest() {

  const initialAmount = Number(
    document.getElementById("initialAmount").value
  );

  const monthlyContribution = Number(
    document.getElementById("monthlyContribution").value
  );

  const interestRate = Number(
    document.getElementById("interestRate").value
  );

  const years = Number(
    document.getElementById("years").value
  );

  try {

    const response = await fetch(
      `${API_BASE_URL}/compound-interest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          initialAmount,
          monthlyContribution,
          interestRate,
          years
        })
      }
    );

    const data = await response.json();

    latestSimulation = {
      ...data,
      initialAmount,
      monthlyContribution,
      interestRate,
      years
    };

    document.getElementById("result-card")
      .classList.remove("hidden");

    document.getElementById("totalInvested")
      .textContent = formatCurrency(data.totalInvested);

    document.getElementById("totalInterest")
      .textContent = formatCurrency(data.totalInterest);

    document.getElementById("finalAmount")
      .textContent = formatCurrency(data.finalAmount);

  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

async function saveSimulation() {

  const simulationName = document
    .getElementById("simulationName")
    .value;

  if (!simulationName || !latestSimulation) {
    return alert("Calculate and name your simulation first.");
  }

  try {

    const response = await fetch(
      `${API_BASE_URL}/save-simulation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: simulationName,
          ...latestSimulation
        })
      }
    );

    const data = await response.json();

    savedSimulations.unshift({
      name: simulationName,
      ...latestSimulation
    });

    renderSavedSimulations();

    document.getElementById("simulationName").value = "";

    alert(data.message);

  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

function renderSavedSimulations() {

  const container = document
    .getElementById("savedSimulations");

  if (savedSimulations.length === 0) {
    container.innerHTML = `
      <p class="empty-message">
        No simulations saved yet.
      </p>
    `;
    return;
  }

  container.innerHTML = savedSimulations
    .map(simulation => `
      <div class="saved-item">
        <h3>${simulation.name}</h3>

        <p>
          Final Amount:
          <strong>
            ${formatCurrency(simulation.finalAmount)}
          </strong>
        </p>

        <p>
          Interest Earned:
          <strong>
            ${formatCurrency(simulation.totalInterest)}
          </strong>
        </p>

        <p>
          ${simulation.years} years
          • ${simulation.interestRate}% yearly
        </p>
      </div>
    `)
    .join("");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}