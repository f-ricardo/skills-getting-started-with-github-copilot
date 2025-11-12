document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Monta a lista de participantes como HTML com ícone de exclusão
        const participantsList = details.participants.length
          ? `<ul class="participants-list">${details.participants
              .map(
                (email) =>
                  `<li style="list-style:none;display:flex;align-items:center;gap:6px;">
                  <span>${email}</span>
                  <span class="delete-participant" title="Remover" data-activity="${encodeURIComponent(
                    name
                  )}" data-email="${encodeURIComponent(
                    email
                  )}" style="cursor:pointer;color:#c62828;font-size:18px;line-height:1;">&#128465;</span>
                </li>`
              )
              .join("")}</ul>`
          : `<div style="color:#888;font-size:14px;">Nenhum participante ainda.</div>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="activity-card-participants">
            <h5>Participantes:</h5>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Adiciona listeners para ícones de exclusão após inserir o card
        setTimeout(() => {
          const deleteIcons = activityCard.querySelectorAll(
            ".delete-participant"
          );
          deleteIcons.forEach((icon) => {
            icon.addEventListener("click", async (e) => {
              const activity = decodeURIComponent(
                icon.getAttribute("data-activity")
              );
              const email = decodeURIComponent(icon.getAttribute("data-email"));
              if (confirm(`Remover ${email} de ${activity}?`)) {
                try {
                  const response = await fetch(
                    `/activities/${encodeURIComponent(
                      activity
                    )}/unregister?email=${encodeURIComponent(email)}`,
                    {
                      method: "DELETE",
                    }
                  );
                  const result = await response.json();
                  if (response.ok) {
                    messageDiv.textContent = result.message;
                    messageDiv.className = "success";
                  } else {
                    messageDiv.textContent =
                      result.detail || "Erro ao remover participante";
                    messageDiv.className = "error";
                  }
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => messageDiv.classList.add("hidden"), 5000);
                  fetchActivities();
                } catch (error) {
                  messageDiv.textContent = "Erro ao remover participante.";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                }
              }
            });
          });
        }, 0);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Atualiza a lista após cadastro
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
