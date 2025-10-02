
        // Load preview recipes when page loads
        window.addEventListener('DOMContentLoaded', () => {
            loadPreviewRecipes();
        });

        // Load some popular recipes as preview
        async function loadPreviewRecipes() {
            const previewSearches = ['chicken', 'pasta', 'dessert'];
            const randomSearch = previewSearches[Math.floor(Math.random() * previewSearches.length)];
            await fetchRecipes(randomSearch);
        }

        // Listen for search button click
        document.getElementById("searchBtn").addEventListener("click", () => {
            const query = document.getElementById("searchBox").value.trim();
            if (query) {
                fetchRecipes(query);
            }
        });

        // Listen for Enter key in search box
        document.getElementById("searchBox").addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                const query = document.getElementById("searchBox").value.trim();
                if (query) {
                    fetchRecipes(query);
                }
            }
        });

        // Fetch recipes from API
        async function fetchRecipes(query) {
            const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data.meals) {
                    displayRecipes(data.meals);
                } else {
                    document.getElementById("recipeContainer").innerHTML = `<p style="color: white; padding: 20px;">No recipes found. Try another search!</p>`;
                }
            } catch (error) {
                console.error("Error fetching recipes:", error);
                document.getElementById("recipeContainer").innerHTML = `<p style="color: white; padding: 20px;">Error loading recipes. Please try again.</p>`;
            }
        }

        // Display recipes as cards
        function displayRecipes(recipes) {
            const container = document.getElementById("recipeContainer");
            container.innerHTML = ""; // clear old results

            recipes.forEach(meal => {
                const card = document.createElement("div");
                card.classList.add("recipe-card");

                // short preview of instructions (first 90 chars)
                const preview = meal.strInstructions ? meal.strInstructions.slice(0, 90).replace(/\n/g, " ") + "..." : "";

                card.innerHTML = `
                    <img src="${meal.strMealThumb}" alt="${escapeHtml(meal.strMeal)}">
                    <div style="padding:10px;">
                        <h3>${escapeHtml(meal.strMeal)}</h3>
                        <p class="recipe-meta"><strong>Category:</strong> ${escapeHtml(meal.strCategory || "—")} • <strong>Area:</strong> ${escapeHtml(meal.strArea || "—")}</p>
                        <p>${escapeHtml(preview)}</p>
                        <button class="open-recipe-btn" data-id="${meal.idMeal}">View Recipe</button>
                    </div>
                `;

                // click button to open modal
                card.querySelector(".open-recipe-btn").addEventListener("click", () => {
                    openRecipeModal(meal);
                });

                container.appendChild(card);
            });
        }

        // helper: escape to avoid accidental HTML injection
        function escapeHtml(text = "") {
            return text.replace(/[&<>"']/g, (m) => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[m]));
        }

        // Build ingredients array from meal object
        function getIngredients(meal) {
            const items = [];
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim()) {
                    items.push(`${measure ? measure.trim() + " " : ""}${ingredient.trim()}`);
                }
            }
            return items;
        }

        // Modal open function
        function openRecipeModal(meal) {
            const modal = document.getElementById("recipeModal");
            const modalBody = document.getElementById("modalBody");
            const ingredients = getIngredients(meal);
            const youtube = meal.strYoutube && meal.strYoutube.trim();

            modalBody.innerHTML = `
                <div class="modal-body-title">
                    <img src="${meal.strMealThumb}" alt="${escapeHtml(meal.strMeal)}">
                    <div>
                        <h2>${escapeHtml(meal.strMeal)}</h2>
                        <p class="recipe-meta"><strong>Category:</strong> ${escapeHtml(meal.strCategory || "—")} • <strong>Area:</strong> ${escapeHtml(meal.strArea || "—")}</p>
                        <div class="ingredients-list">
                            ${ingredients.map(i => `<div>• ${escapeHtml(i)}</div>`).join("")}
                        </div>
                        ${youtube ? `<p><a class="youtube-link" href="${youtube}" target="_blank" rel="noopener">Watch on YouTube</a></p>` : ""}
                    </div>
                </div>
                <div class="instructions">
                    <h3>Instructions</h3>
                    <p>${escapeHtml(meal.strInstructions || "No instructions available.")}</p>
                </div>
            `;

            // show modal
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden"; // prevent background scroll
        }

        // modal close helpers
        document.getElementById("modalClose").addEventListener("click", closeModal);
        document.getElementById("modalBackdrop").addEventListener("click", closeModal);

        function closeModal() {
            const modal = document.getElementById("recipeModal");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = ""; // restore scroll
        }

        // Add click listeners for food suggestions
        document.querySelectorAll(".suggestion").forEach(item => {
            item.addEventListener("click", () => {
                const food = item.textContent;
                fetchRecipes(food);
            });
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        // Close sidebar when clicking overlay
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                }
            }
        });

        // Close sidebar when a suggestion is clicked on mobile
        document.querySelectorAll('.suggestion').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
