/******************************************************************************
 *
 * NBHAS
 * Nature's Balance Hormone Assessment System
 *
 * Product Owner : John Boshoff
 *
 * Knowledge Base Driven
 *
 * Master Data is the single source of truth.
 *
 ******************************************************************************/

'use strict';

/******************************************************************************
 * Global NBHAS object
 ******************************************************************************/

const NBHAS = {

    version: '0.1.0',

    sections: [],
    symptoms: [],
    categories: [],
    recommendations: [],
    resources: [],

    currentCategory: null,
    assessment: {},

};
