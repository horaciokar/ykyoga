document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const feedbackDiv = document.getElementById('form-feedback');

    // Solo ejecutar si el formulario de contacto existe en la página actual
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevenir el envío tradicional del formulario

            // Limpiar feedback anterior
            feedbackDiv.style.display = 'none';
            feedbackDiv.textContent = '';
            feedbackDiv.className = '';

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value,
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (result.success) {
                    feedbackDiv.textContent = result.message;
                    feedbackDiv.classList.add('success');
                    feedbackDiv.style.display = 'block';
                    contactForm.reset(); // Limpiar el formulario
                } else {
                    throw new Error(result.message || 'Ocurrió un error.');
                }
            } catch (error) {
                feedbackDiv.textContent = `Error: ${error.message}`;
                feedbackDiv.classList.add('error');
                feedbackDiv.style.display = 'block';
            }
        });
    }
});
