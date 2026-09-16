// ==UserScript==
// @name         Modulr – Dupliquer & Associer Client
// @namespace    https://github.com/BiggerThanTheMall/tampermonkey-ltoa
// @version      1.9.1
// @description  Duplique une fiche client et l’associe automatiquement au client d’origine
// @author       LTOA
// @match        https://courtage.modulr.fr/fr/scripts/clients/clients_card.php*
// @match        https://courtage.modulr.fr/fr/scripts/clients/clients_manage.php*
// @run-at       document-idle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle

// @updateURL    https://raw.githubusercontent.com/BiggerThanTheMall/Duplique-une-fiche-client-et-l-associe-automatiquement-au-client-d-origine/main/Modulr-Dupliquer-Associer-Client.user.js
// @downloadURL  https://raw.githubusercontent.com/BiggerThanTheMall/Duplique-une-fiche-client-et-l-associe-automatiquement-au-client-d-origine/main/Modulr-Dupliquer-Associer-Client.user.js
// ==/UserScript==

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // STYLES CSS
    // ═══════════════════════════════════════════════════════════════
    GM_addStyle(`
        /* Bouton icône style Modulr */
        .ltoa-duplicate-icon {
            cursor: pointer;
            margin-right: 4px;
        }

        .ltoa-duplicate-icon .fa-stack-2x {
            color: #688396;
            transition: color 0.2s ease;
        }

        .ltoa-duplicate-icon:hover .fa-stack-2x {
            color: #215c7f;
        }

        .ltoa-duplicate-icon .fa-stack-1x {
            color: white;
        }

        /* Modal Overlay */
        .ltoa-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .ltoa-modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        /* Modal Container */
        .ltoa-modal {
            background: white;
            border-radius: 16px;
            width: 95%;
            max-width: 580px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.9) translateY(20px);
            transition: all 0.3s ease;
        }

        .ltoa-modal-overlay.active .ltoa-modal {
            transform: scale(1) translateY(0);
        }

        /* Modal Header */
        .ltoa-modal-header {
            background: linear-gradient(135deg, #215c7f 0%, #1b4d69 100%);
            color: white;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .ltoa-modal-header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .ltoa-modal-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .ltoa-modal-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: rotate(90deg);
        }

        /* Modal Body */
        .ltoa-modal-body {
            padding: 24px;
            max-height: 60vh;
            overflow-y: auto;
        }

        /* Section Title */
        .ltoa-section-title {
            font-size: 13px;
            font-weight: 600;
            color: #688396;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e0d3b1;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Form Grid */
        .ltoa-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
        }

        /* Form Group */
        .ltoa-form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .ltoa-form-group.full-width {
            grid-column: 1 / -1;
        }

        .ltoa-form-group label {
            font-size: 12px;
            font-weight: 600;
            color: #555;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .ltoa-form-group label .fa {
            color: #688396;
            font-size: 11px;
        }

        .ltoa-form-group label .required {
            color: #e74c3c;
        }

        .ltoa-form-group input,
        .ltoa-form-group select {
            padding: 10px 14px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s ease;
            background: #fafafa;
        }

        .ltoa-form-group input:focus,
        .ltoa-form-group select:focus {
            outline: none;
            border-color: #688396;
            background: white;
            box-shadow: 0 0 0 3px rgba(104, 131, 150, 0.1);
        }

        .ltoa-form-group input::placeholder {
            color: #aaa;
        }

        .ltoa-form-group input.error {
            border-color: #e74c3c;
            background: #fef5f5;
        }

        /* Association Type Select */
        .ltoa-association-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 8px;
        }

        .ltoa-association-option {
            position: relative;
        }

        .ltoa-association-option input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
        }

        .ltoa-association-option label {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 14px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 13px;
            font-weight: 500;
            background: #fafafa;
        }

        .ltoa-association-option input:checked + label {
            border-color: #215c7f;
            background: linear-gradient(135deg, rgba(33, 92, 127, 0.08) 0%, rgba(104, 131, 150, 0.08) 100%);
            color: #215c7f;
        }

        .ltoa-association-option label:hover {
            border-color: #688396;
            background: #f5f5f5;
        }

        .ltoa-association-option .ltoa-radio-dot {
            width: 18px;
            height: 18px;
            border: 2px solid #ccc;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }

        .ltoa-association-option input:checked + label .ltoa-radio-dot {
            border-color: #215c7f;
        }

        .ltoa-association-option input:checked + label .ltoa-radio-dot::after {
            content: '';
            width: 10px;
            height: 10px;
            background: #215c7f;
            border-radius: 50%;
        }

        /* Modal Footer */
        .ltoa-modal-footer {
            padding: 16px 24px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }

        .ltoa-btn {
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            border: none;
        }

        .ltoa-btn-secondary {
            background: #e0e0e0;
            color: #555;
        }

        .ltoa-btn-secondary:hover {
            background: #d0d0d0;
        }

        .ltoa-btn-primary {
            background: linear-gradient(135deg, #688396 0%, #215c7f 100%);
            color: white;
            box-shadow: 0 2px 8px rgba(33, 92, 127, 0.3);
        }

        .ltoa-btn-primary:hover {
            background: linear-gradient(135deg, #215c7f 0%, #1b4d69 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(33, 92, 127, 0.4);
        }

        .ltoa-btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        /* Info Box */
        .ltoa-info-box {
            background: linear-gradient(135deg, rgba(214, 196, 145, 0.2) 0%, rgba(214, 196, 145, 0.1) 100%);
            border: 1px solid #d6c491;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .ltoa-info-box .fa {
            color: #b5a060;
            font-size: 16px;
            margin-top: 2px;
        }

        .ltoa-info-box-content {
            font-size: 13px;
            color: #666;
            line-height: 1.5;
        }

        .ltoa-info-box-content strong {
            color: #444;
        }

        /* Loading State */
        .ltoa-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            gap: 16px;
        }

        .ltoa-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e0e0e0;
            border-top-color: #215c7f;
            border-radius: 50%;
            animation: ltoa-spin 1s linear infinite;
        }

        @keyframes ltoa-spin {
            to { transform: rotate(360deg); }
        }

        .ltoa-loading-text {
            font-size: 14px;
            color: #666;
            text-align: center;
        }

        /* Toast Notification */
        .ltoa-toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #215c7f;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 999999;
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
        }

        .ltoa-toast.show {
            transform: translateY(0);
            opacity: 1;
        }

        .ltoa-toast.success {
            background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
        }

        .ltoa-toast.error {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        }

        /* Scrollbar */
        .ltoa-modal-body::-webkit-scrollbar {
            width: 8px;
        }

        .ltoa-modal-body::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        .ltoa-modal-body::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }

        .ltoa-modal-body::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }

        /* Processing overlay */
        .ltoa-processing-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.97);
            z-index: 999998;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }

        .ltoa-processing-overlay .ltoa-spinner {
            width: 60px;
            height: 60px;
        }

        .ltoa-processing-overlay .ltoa-processing-text {
            font-size: 18px;
            color: #215c7f;
            font-weight: 600;
        }

        .ltoa-processing-overlay .ltoa-processing-step {
            font-size: 14px;
            color: #666;
        }
    `);

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION DES TYPES D'ASSOCIATION
    // ═══════════════════════════════════════════════════════════════
    const ASSOCIATION_TYPES = [
        { value: '102', label: 'Conjoint', icon: '💑' },
        { value: '104', label: 'Enfant', icon: '👶' },
        { value: '105', label: 'Parent', icon: '👨‍👩‍👧' },
        { value: '108', label: 'Frère/Sœur', icon: '👫' },
        { value: '66', label: 'Autre', icon: '👤' },
        { value: '67', label: 'Dirigeant Assimilé Salarié', icon: '👔' },
        { value: '68', label: 'Dirigeant TNS', icon: '💼' },
        { value: '69', label: 'Employé', icon: '🧑‍💼' },
        { value: '70', label: 'Établissement', icon: '🏢' },
        { value: '71', label: 'Filiale', icon: '🏛️' }
    ];

    // ═══════════════════════════════════════════════════════════════
    // UTILITAIRES
    // ═══════════════════════════════════════════════════════════════
    function showToast(message, type = 'success') {
        document.querySelectorAll('.ltoa-toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `ltoa-toast ${type}`;
        toast.innerHTML = `
            <span class="fa fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></span>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function showProcessingOverlay(text, step) {
        let overlay = document.querySelector('.ltoa-processing-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'ltoa-processing-overlay';
            overlay.innerHTML = `
                <div class="ltoa-spinner"></div>
                <div class="ltoa-processing-text">${text}</div>
                <div class="ltoa-processing-step">${step}</div>
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.querySelector('.ltoa-processing-text').textContent = text;
            overlay.querySelector('.ltoa-processing-step').textContent = step;
        }
    }

    function hideProcessingOverlay() {
        const overlay = document.querySelector('.ltoa-processing-overlay');
        if (overlay) overlay.remove();
    }

    // Simuler un vrai clic utilisateur (pour jQuery UI autocomplete)
    function simulateRealClick(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const eventOptions = {
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY
        };

        element.dispatchEvent(new MouseEvent('mousedown', eventOptions));
        element.dispatchEvent(new MouseEvent('mouseup', eventOptions));
        element.dispatchEvent(new MouseEvent('click', eventOptions));
    }

    function extractClientData() {
        const data = {
            id: null,
            civilite: '0',
            nom: '',
            prenom: '',
            dateNaissance: '',
            email: '',
            telephone: '',
            adresse: '',
            codePostal: '',
            ville: '',
            pays: 'FRANCE'
        };

        // Extraire l'ID du client
        const clientIdInput = document.querySelector('#client_id_');
        if (clientIdInput) {
            data.id = clientIdInput.value;
        }

        // Extraire nom depuis le titre de la page
        // Format: "NOM, Prénom" ou avec icône devant
        const pageTitle = document.querySelector('.page_title');
        if (pageTitle) {
            // Prendre le textContent et chercher le pattern "NOM, Prénom"
            const titleText = pageTitle.textContent.trim();

            // Chercher le pattern avec virgule : tout avant la virgule = NOM, tout après = Prénom
            const commaIndex = titleText.indexOf(',');
            if (commaIndex !== -1) {
                // Extraire la partie avant la virgule
                let nomPart = titleText.substring(0, commaIndex).trim();
                let prenomPart = titleText.substring(commaIndex + 1).trim();

                // Le nom peut avoir des espaces avant (à cause de l'icône), on nettoie
                // On garde TOUT le nom tel quel, sans enlever de caractères
                // Juste supprimer les espaces en début/fin
                data.nom = nomPart.trim();
                data.prenom = prenomPart.trim();

                console.log('LTOA: Nom extrait:', data.nom);
                console.log('LTOA: Prénom extrait:', data.prenom);
            }
        }

        // Extraire email
        const emailLink = document.querySelector('.vcard_bottom_line a[href*="documents_send.php"]');
        if (emailLink) {
            data.email = emailLink.getAttribute('title') || emailLink.textContent.trim();
        }

        // Extraire téléphone
        const phoneLink = document.querySelector('.vcard_bottom_line a[href^="tel:"]');
        if (phoneLink) {
            data.telephone = phoneLink.textContent.trim();
        }

        // Extraire adresse
        const addressBlock = document.querySelector('.address_block_content');
        if (addressBlock) {
            const lines = addressBlock.innerHTML.split('<br>').map(l => l.trim()).filter(l => l);
            if (lines.length >= 2) {
                data.adresse = lines[0];
                const cpVille = lines[1].match(/(\d{5})\s+(.+)/);
                if (cpVille) {
                    data.codePostal = cpVille[1];
                    data.ville = cpVille[2];
                }
            }
        }

        return data;
    }

    // ═══════════════════════════════════════════════════════════════
    // CRÉATION DU MODAL
    // ═══════════════════════════════════════════════════════════════
    function createModal(clientData) {
        const overlay = document.createElement('div');
        overlay.className = 'ltoa-modal-overlay';
        overlay.id = 'ltoa-duplicate-modal';

        const associationOptions = ASSOCIATION_TYPES.map((type, index) => `
            <div class="ltoa-association-option">
                <input type="radio" name="association_type" id="assoc_${type.value}" value="${type.value}" ${index === 0 ? 'checked' : ''}>
                <label for="assoc_${type.value}">
                    <span class="ltoa-radio-dot"></span>
                    <span>${type.icon} ${type.label}</span>
                </label>
            </div>
        `).join('');

        overlay.innerHTML = `
            <div class="ltoa-modal">
                <div class="ltoa-modal-header">
                    <h2><span class="fa fa-clone"></span> Dupliquer & Associer</h2>
                    <button class="ltoa-modal-close" id="ltoa-close-modal">
                        <span class="fa fa-times"></span>
                    </button>
                </div>
                <div class="ltoa-modal-body">
                    <div class="ltoa-info-box">
                        <span class="fa fa-info-circle"></span>
                        <div class="ltoa-info-box-content">
                            Création d'une nouvelle fiche liée à <strong>${clientData.prenom} ${clientData.nom}</strong>.
                        </div>
                    </div>

                    <h3 class="ltoa-section-title">
                        <span class="fa fa-user"></span> Nouveau client
                    </h3>
                    <div class="ltoa-form-grid">
                        <div class="ltoa-form-group">
                            <label><span class="fa fa-user-tie"></span> Civilité</label>
                            <select id="ltoa-civilite">
                                <option value="0"></option>
                                <option value="1">M.</option>
                                <option value="2">Mme</option>
                                <option value="3">Mlle</option>
                                <option value="4">M. et Mme</option>
                                <option value="5">M. et Mlle</option>
                                <option value="6">Dr</option>
                                <option value="7">Me</option>
                            </select>
                        </div>
                        <div class="ltoa-form-group">
                            <label><span class="fa fa-calendar"></span> Date de naissance <span class="required">*</span></label>
                            <input type="text" id="ltoa-date-naissance" value="" placeholder="JJ/MM/AAAA" required>
                        </div>
                        <div class="ltoa-form-group">
                            <label><span class="fa fa-id-card"></span> Nom</label>
                            <input type="text" id="ltoa-nom" value="${clientData.nom}">
                        </div>
                        <div class="ltoa-form-group">
                            <label><span class="fa fa-id-card"></span> Prénom <span class="required">*</span></label>
                            <input type="text" id="ltoa-prenom" value="" placeholder="Prénom du nouveau client" required>
                        </div>
                        <div class="ltoa-form-group">
                            <label><span class="fa fa-envelope"></span> Email</label>
                            <input type="email" id="ltoa-email" value="${clientData.email}" placeholder="email@exemple.com">
                        </div>
                        <div class="ltoa-form-group">
                            <label><span class="fa fa-phone"></span> Téléphone mobile</label>
                            <input type="text" id="ltoa-telephone" value="${clientData.telephone}" placeholder="06 XX XX XX XX">
                        </div>
                    </div>

                    <h3 class="ltoa-section-title">
                        <span class="fa fa-home"></span> Adresse
                    </h3>
                    <div class="ltoa-form-grid">
                        <div class="ltoa-form-group full-width">
                            <label><span class="fa fa-map-marker-alt"></span> Adresse</label>
                            <input type="text" id="ltoa-adresse" value="${clientData.adresse}">
                        </div>
                        <div class="ltoa-form-group">
                            <label><span class="fa fa-map-pin"></span> Code postal</label>
                            <input type="text" id="ltoa-code-postal" value="${clientData.codePostal}">
                        </div>
                        <div class="ltoa-form-group">
                            <label><span class="fa fa-city"></span> Ville</label>
                            <input type="text" id="ltoa-ville" value="${clientData.ville}">
                        </div>
                    </div>

                    <h3 class="ltoa-section-title">
                        <span class="fa fa-link"></span> Lien avec ${clientData.prenom} ${clientData.nom}
                    </h3>
                    <div class="ltoa-association-grid">
                        ${associationOptions}
                    </div>
                </div>
                <div class="ltoa-modal-footer">
                    <button class="ltoa-btn ltoa-btn-secondary" id="ltoa-cancel">
                        <span class="fa fa-times"></span> Annuler
                    </button>
                    <button class="ltoa-btn ltoa-btn-primary" id="ltoa-submit" disabled>
                        <span class="fa fa-check"></span> Créer & Associer
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 10);

        document.getElementById('ltoa-close-modal').addEventListener('click', closeModal);
        document.getElementById('ltoa-cancel').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Validation en temps réel
        const prenomInput = document.getElementById('ltoa-prenom');
        const dateInput = document.getElementById('ltoa-date-naissance');
        const submitBtn = document.getElementById('ltoa-submit');

        function validateForm() {
            const prenom = prenomInput.value.trim();
            const date = dateInput.value.trim();
            const dateValid = /^\d{2}\/\d{2}\/\d{4}$/.test(date);

            prenomInput.classList.toggle('error', !prenom);
            dateInput.classList.toggle('error', !date || !dateValid);

            submitBtn.disabled = !prenom || !date || !dateValid;
        }

        prenomInput.addEventListener('input', validateForm);
        dateInput.addEventListener('input', validateForm);

        document.getElementById('ltoa-submit').addEventListener('click', () => handleSubmit(clientData));
        setTimeout(() => prenomInput.focus(), 300);
    }

    function closeModal() {
        const overlay = document.getElementById('ltoa-duplicate-modal');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // LOGIQUE DE SOUMISSION
    // ═══════════════════════════════════════════════════════════════
    async function handleSubmit(originalClientData) {
        const newClientData = {
            civilite: document.getElementById('ltoa-civilite').value,
            nom: document.getElementById('ltoa-nom').value.trim(),
            prenom: document.getElementById('ltoa-prenom').value.trim(),
            dateNaissance: document.getElementById('ltoa-date-naissance').value.trim(),
            email: document.getElementById('ltoa-email').value.trim(),
            telephone: document.getElementById('ltoa-telephone').value.trim(),
            adresse: document.getElementById('ltoa-adresse').value.trim(),
            codePostal: document.getElementById('ltoa-code-postal').value.trim(),
            ville: document.getElementById('ltoa-ville').value.trim(),
            associationType: document.querySelector('input[name="association_type"]:checked').value,
            originalClientId: originalClientData.id,
            originalNom: originalClientData.nom,
            originalPrenom: originalClientData.prenom
        };

        if (!newClientData.prenom) {
            showToast('Le prénom est obligatoire', 'error');
            return;
        }

        if (!newClientData.dateNaissance || !/^\d{2}\/\d{2}\/\d{4}$/.test(newClientData.dateNaissance)) {
            showToast('La date de naissance est obligatoire (format JJ/MM/AAAA)', 'error');
            return;
        }

        closeModal();
        showProcessingOverlay('Création en cours...', 'Étape 1/3 : Création de la fiche client');

        GM_setValue('ltoa_pending_client', JSON.stringify(newClientData));
        GM_setValue('ltoa_workflow_step', 'create_client');

        window.location.href = 'https://courtage.modulr.fr/fr/scripts/clients/clients_manage.php?office=1&add_type=0';
    }

    // ═══════════════════════════════════════════════════════════════
    // GESTION PAGE DE CRÉATION CLIENT
    // ═══════════════════════════════════════════════════════════════
    function handleClientCreationPage() {
        const workflowStep = GM_getValue('ltoa_workflow_step', null);
        if (workflowStep !== 'create_client') return;

        const pendingData = GM_getValue('ltoa_pending_client', null);
        if (!pendingData) return;

        const clientData = JSON.parse(pendingData);

        showProcessingOverlay('Création en cours...', 'Remplissage du formulaire...');

        const checkForm = setInterval(() => {
            const nomField = document.querySelector('input[name="client[last_name]"]');
            if (nomField) {
                clearInterval(checkForm);
                fillClientForm(clientData);
            }
        }, 300);

        setTimeout(() => clearInterval(checkForm), 15000);
    }

    function fillClientForm(clientData) {
        console.log('LTOA: Remplissage formulaire:', clientData);

        const fillField = (selector, value) => {
            if (!value) return false;
            const field = document.querySelector(selector);
            if (field) {
                field.value = value;
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
            return false;
        };

        const clickMultiSelectRadio = (name, value) => {
            if (!value || value === '0') return false;
            const radio = document.querySelector(`input[name="selectItem${name}"][value="${value}"]`);
            if (radio) {
                radio.click();
                return true;
            }
            return false;
        };

        setTimeout(() => {
            clickMultiSelectRadio('client[title]', clientData.civilite);
            fillField('input[name="client[last_name]"]', clientData.nom);
            fillField('input[name="client[first_name]"]', clientData.prenom);
            fillField('input[name="client[birth_date]"]', clientData.dateNaissance);
            fillField('input[name="client[email]"]', clientData.email);
            fillField('input[name="client[mobile_phone]"]', clientData.telephone);
            fillField('input[name="client[address_1]"]', clientData.adresse);
            fillField('input[name="client[zip_code]"]', clientData.codePostal);
            fillField('input[name="client[city]"]', clientData.ville);

            GM_setValue('ltoa_workflow_step', 'waiting_redirect');

            setTimeout(() => {
                showProcessingOverlay('Création en cours...', 'Enregistrement...');
                const submitBtn = document.querySelector('button.formCreationEntities[type="submit"]');
                if (submitBtn) {
                    submitBtn.click();
                }
            }, 1000);

        }, 1000);
    }

    // ═══════════════════════════════════════════════════════════════
    // POST-CRÉATION
    // ═══════════════════════════════════════════════════════════════
    function handlePostCreationRedirect() {
        const workflowStep = GM_getValue('ltoa_workflow_step', null);
        if (workflowStep !== 'waiting_redirect') return;

        const pendingData = GM_getValue('ltoa_pending_client', null);
        if (!pendingData) return;

        const clientData = JSON.parse(pendingData);

        if (window.location.href.includes('clients_card.php')) {
            const match = window.location.href.match(/id=(\d+)/);
            if (match) {
                const newClientId = match[1];

                if (newClientId !== clientData.originalClientId) {
                    console.log('LTOA: Nouvelle fiche ID:', newClientId);

                    showProcessingOverlay('Association en cours...', 'Étape 2/3 : Liaison des fiches...');

                    clientData.newClientId = newClientId;
                    GM_setValue('ltoa_pending_client', JSON.stringify(clientData));
                    GM_setValue('ltoa_workflow_step', 'associate_client');

                    setTimeout(() => {
                        window.location.href = `https://courtage.modulr.fr/fr/scripts/clients/clients_card.php?id=${clientData.originalClientId}#entity_menu_client=7&entity_menu_client_association=1`;
                    }, 500);
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ASSOCIATION
    // ═══════════════════════════════════════════════════════════════
    function handleAssociationPage() {
        const workflowStep = GM_getValue('ltoa_workflow_step', null);
        if (workflowStep !== 'associate_client') return;

        const pendingData = GM_getValue('ltoa_pending_client', null);
        if (!pendingData) return;

        const clientData = JSON.parse(pendingData);
        console.log('LTOA: Association:', clientData);

        showProcessingOverlay('Association en cours...', 'Ouverture du menu...');

        setTimeout(() => {
            // Onglet Associations
            const associationsTab = document.querySelector('.entity_menu_item_7');
            if (associationsTab) associationsTab.click();

            setTimeout(() => {
                // Sous-onglet Clients/groupes
                const clientsGroupsTab = document.querySelector('.entity_menu_item_30');
                if (clientsGroupsTab) clientsGroupsTab.click();

                setTimeout(() => {
                    performAssociation(clientData);
                }, 1000);
            }, 800);
        }, 1000);
    }

    function performAssociation(clientData) {
        showProcessingOverlay('Association en cours...', 'Recherche du client...');

        const attachBtn = document.querySelector('#change_client_association');
        if (attachBtn) {
            attachBtn.click();

            setTimeout(() => {
                const searchInput = document.querySelector('#client_to_attach');
                if (searchInput) {
                    const searchTerm = clientData.nom;
                    console.log('LTOA: Recherche avec terme:', searchTerm);

                    searchInput.focus();

                    // Essayer avec jQuery si disponible
                    if (typeof jQuery !== 'undefined' && jQuery(searchInput).autocomplete) {
                        console.log('LTOA: Utilisation de jQuery autocomplete');
                        jQuery(searchInput).val(searchTerm);
                        jQuery(searchInput).autocomplete('search', searchTerm);
                    } else {
                        console.log('LTOA: jQuery non disponible, simulation clavier');
                        // Simuler la frappe caractère par caractère
                        simulateTyping(searchInput, searchTerm);
                    }

                    // Attendre que l'autocomplete charge les résultats
                    waitForAutocomplete(clientData);
                }
            }, 1000);
        }
    }

    function simulateTyping(input, text) {
        input.value = '';
        input.focus();

        for (let i = 0; i < text.length; i++) {
            setTimeout(() => {
                input.value += text[i];

                // Déclencher les événements
                const keydownEvent = new KeyboardEvent('keydown', {
                    key: text[i],
                    code: 'Key' + text[i].toUpperCase(),
                    bubbles: true
                });
                const inputEvent = new Event('input', { bubbles: true });
                const keyupEvent = new KeyboardEvent('keyup', {
                    key: text[i],
                    code: 'Key' + text[i].toUpperCase(),
                    bubbles: true
                });

                input.dispatchEvent(keydownEvent);
                input.dispatchEvent(inputEvent);
                input.dispatchEvent(keyupEvent);
            }, i * 50);
        }
    }

    function waitForAutocomplete(clientData) {
        let attempts = 0;
        const maxAttempts = 25;

        const checkInterval = setInterval(() => {
            attempts++;

            // Chercher la liste autocomplete visible
            const autocompleteList = document.querySelector('.ui-autocomplete:not([style*="display: none"])');
            const items = autocompleteList ? autocompleteList.querySelectorAll('li.ui-menu-item') : [];

            console.log(`LTOA: Tentative ${attempts}, items: ${items.length}`);

            if (items.length > 0) {
                clearInterval(checkInterval);
                selectFromAutocomplete(clientData, items);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                hideProcessingOverlay();
                showToast('Autocomplete non chargé. Terminez manuellement.', 'error');
                GM_deleteValue('ltoa_pending_client');
                GM_deleteValue('ltoa_workflow_step');
            }
        }, 300);
    }

    function selectFromAutocomplete(clientData, items) {
        showProcessingOverlay('Association en cours...', 'Sélection du client...');

        // Rechercher par NOM et PRÉNOM du nouveau client
        const searchNom = clientData.nom.toUpperCase();
        const searchPrenom = clientData.prenom.toUpperCase();
        let foundIndex = -1;

        console.log(`LTOA: Recherche "${searchPrenom} ${searchNom}" parmi ${items.length} items`);

        for (let i = 0; i < items.length; i++) {
            const li = items[i];
            const anchor = li.querySelector('a');
            if (!anchor) continue;

            const itemText = anchor.textContent.toUpperCase();

            console.log('LTOA: Compare avec:', itemText);

            // Vérifier si NOM et PRÉNOM sont dans le texte
            if (itemText.includes(searchNom) && itemText.includes(searchPrenom)) {
                foundIndex = i;
                console.log('LTOA: Match trouvé à index', i);
                break;
            }
        }

        if (foundIndex !== -1) {
            const searchInput = document.querySelector('#client_to_attach');

            // Utiliser jQuery UI autocomplete API pour sélectionner
            if (typeof jQuery !== 'undefined') {
                try {
                    const $input = jQuery(searchInput);
                    const menuItems = $input.autocomplete('widget').find('li');

                    if (menuItems.length > foundIndex) {
                        // Simuler la sélection via jQuery UI
                        const selectedItem = menuItems.eq(foundIndex);
                        const itemData = selectedItem.data('item.autocomplete') || selectedItem.data('ui-autocomplete-item');

                        if (itemData) {
                            // Déclencher l'événement select de jQuery UI
                            $input.val(itemData.value || itemData.label);

                            // Trouver et remplir le champ hidden
                            const hiddenInput = document.querySelector('#client_to_attach_id');
                            if (hiddenInput && itemData.id) {
                                hiddenInput.value = itemData.id;
                            }

                            // Fermer l'autocomplete
                            $input.autocomplete('close');

                            console.log('LTOA: Sélection via jQuery UI réussie');
                            setTimeout(() => selectAssociationType(clientData), 500);
                            return;
                        }
                    }
                } catch (e) {
                    console.log('LTOA: Erreur jQuery UI:', e);
                }
            }

            // Fallback : simuler touches clavier pour naviguer et sélectionner
            console.log('LTOA: Fallback clavier');
            const searchInput2 = document.querySelector('#client_to_attach');
            searchInput2.focus();

            // Appuyer sur flèche bas pour naviguer jusqu'à l'item
            for (let i = 0; i <= foundIndex; i++) {
                const downEvent = new KeyboardEvent('keydown', {
                    key: 'ArrowDown',
                    keyCode: 40,
                    bubbles: true
                });
                searchInput2.dispatchEvent(downEvent);
            }

            // Appuyer sur Entrée pour sélectionner
            setTimeout(() => {
                const enterEvent = new KeyboardEvent('keydown', {
                    key: 'Enter',
                    keyCode: 13,
                    bubbles: true
                });
                searchInput2.dispatchEvent(enterEvent);

                setTimeout(() => selectAssociationType(clientData), 500);
            }, 300);

        } else {
            hideProcessingOverlay();
            showToast('Client non trouvé. Terminez manuellement.', 'error');
            GM_deleteValue('ltoa_pending_client');
            GM_deleteValue('ltoa_workflow_step');
        }
    }

    function selectAssociationType(clientData) {
        showProcessingOverlay('Association en cours...', 'Étape 3/3 : Validation...');

        console.log('LTOA: selectAssociationType, newClientId:', clientData.newClientId);

        // Sauvegarder l'ID du nouveau client pour la redirection finale
        GM_setValue('ltoa_new_client_id', clientData.newClientId);

        // Sélectionner le type via multi-select
        const msOption = document.querySelector(`input[name="selectItemgroup_type"][value="${clientData.associationType}"]`);
        if (msOption) {
            msOption.click();
            console.log('LTOA: Type association cliqué:', clientData.associationType);
        }

        // Aussi le select natif
        const typeSelect = document.querySelector('#change_client_association_block select[name="group_type"]');
        if (typeSelect) {
            typeSelect.value = clientData.associationType;
            typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }

        setTimeout(() => {
            const submitBtn = document.querySelector('#change_client_association_block button[type="submit"]');
            if (submitBtn) {
                console.log('LTOA: Clic sur submit association');

                GM_setValue('ltoa_workflow_step', 'final_redirect');

                submitBtn.click();

                // Attendre un peu puis rediriger
                setTimeout(() => {
                    const newClientId = GM_getValue('ltoa_new_client_id', null);
                    console.log('LTOA: Redirection vers nouveau client ID:', newClientId);

                    showProcessingOverlay('Terminé !', 'Redirection vers la nouvelle fiche...');

                    GM_deleteValue('ltoa_pending_client');
                    GM_deleteValue('ltoa_workflow_step');
                    GM_deleteValue('ltoa_new_client_id');

                    if (newClientId) {
                        window.location.href = `https://courtage.modulr.fr/fr/scripts/clients/clients_card.php?id=${newClientId}#entity_menu_client=0`;
                    }
                }, 1500);
            } else {
                console.log('LTOA: Submit button non trouvé');
            }
        }, 800);
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALISATION
    // ═══════════════════════════════════════════════════════════════
    function init() {
        const currentUrl = window.location.href;
        const workflowStep = GM_getValue('ltoa_workflow_step', null);

        if (currentUrl.includes('clients_manage.php') && currentUrl.includes('add_type=0')) {
            handleClientCreationPage();
            return;
        }

        if (currentUrl.includes('clients_card.php')) {
            if (workflowStep === 'waiting_redirect') {
                handlePostCreationRedirect();
                return;
            }

            if (workflowStep === 'associate_client') {
                handleAssociationPage();
                return;
            }

            if (workflowStep === 'final_redirect') {
                hideProcessingOverlay();
                GM_deleteValue('ltoa_pending_client');
                GM_deleteValue('ltoa_workflow_step');
                showToast('Client créé et associé avec succès !', 'success');
                return;
            }

            addDuplicateButton();
        }
    }

    function addDuplicateButton() {
        const checkReady = setInterval(() => {
            const infoButton = document.querySelector('.card_template_section .tooltip.tooltip_menu.square_icon');
            const iconContainer = infoButton?.closest('.right');

            if (iconContainer) {
                clearInterval(checkReady);

                if (document.querySelector('.ltoa-duplicate-icon')) return;

                const btn = document.createElement('span');
                btn.className = 'fa-stack fa-lg square_icon ltoa-duplicate-icon';
                btn.setAttribute('title', 'Dupliquer & Associer ce client');
                btn.innerHTML = `
                    <span class="fa fa-square fa-stack-2x"></span>
                    <span class="fa fa-clone fa-stack-1x fa-inverse"></span>
                `;

                btn.addEventListener('click', () => {
                    const clientData = extractClientData();
                    createModal(clientData);
                });

                iconContainer.insertBefore(btn, infoButton);
            }
        }, 500);

        setTimeout(() => clearInterval(checkReady), 10000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
