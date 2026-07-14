
'use strict';

(function () {

    /**
     * Prevent the controller from loading more than once.
     */
    if (window.NBHAS_CONTROLLER_LOADED) {
        console.warn('NBHAS controller is already loaded.');
        return;
    }

    window.NBHAS_CONTROLLER_LOADED = true;

    /**
     * Single NBHAS application object.
     */
    const NBHAS = window.NBHAS = window.NBHAS || {};

    Object.assign(NBHAS, {
        version: '4.0.0',

        masterData: null,
        engine: null,

        sections: [],
        symptoms: [],
        categories: [],
        recommendations: [],
        resources: [],

        selectedCategoryGroup: null,
        selectedAssessmentCategory: null,

       journey: {
        screen: 'category-group',
        currentSectionIndex: 0,
        activeSections: [],
        answers: {},

        totals: {
        answered: 0,
        totalScore: 0,
        sections: {}
        }
        },

        state: {
            initialized: false,
            loading: false,
            assessmentRendered: false,
            resultsRendered: false,
            handlersAttached: false
        }
    });

    const CONFIG = {
        masterJsonPath: window.NBHAS_MASTER_JSON_URL,
        analysisDelay: 2000
    };

    console.log('🚀 NBHAS Phase 4A controller loaded');
    console.log('NBHAS JSON URL:', CONFIG.masterJsonPath);

    /**
     * Start after the page DOM is ready.
     */
    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initializeNBHAS
        );
    } else {
        initializeNBHAS();
    }

    /**
     * Main application startup.
     */
    async function initializeNBHAS() {

        if (
            NBHAS.state.initialized ||
            NBHAS.state.loading
        ) {
            return;
        }

        NBHAS.state.loading = true;

        console.log('initializeNBHAS called');

        try {
            validateEnvironment();

            await loadMasterData();

            prepareJourney();

            NBHAS.state.initialized = true;

            console.log('✅ NBHAS initialization complete');
            console.log('Sections:', NBHAS.sections.length);
            console.log('Symptoms:', NBHAS.symptoms.length);
            console.log('Categories:', NBHAS.categories.length);
            console.log(
                'Recommendations:',
                NBHAS.recommendations.length
            );
            console.log('Resources:', NBHAS.resources.length);

            window.dispatchEvent(
                new CustomEvent('nbhas:ready', {
                    detail: {
                        version: NBHAS.version,
                        masterData: NBHAS.masterData
                    }
                })
            );

        } catch (error) {
            console.error(
                '❌ NBHAS initialization failed:',
                error
            );

//            showInitializationError(
//                'The hormone assessment could not be loaded. ' +
//                'Please refresh the page and try again.'
//            );

        } finally {
            NBHAS.state.loading = false;
        }
    }
