/*
 * ============================================================
 * NBHAS Report Module
 * Nature's Balance Hormone Assessment System
 * ============================================================
 */
console.log('✅ nbhas-report.js loaded');

(function () {

    'use strict';

    window.NBHAS = window.NBHAS || {};

    const REPORT = {

        version: '1.0.0',

        getAssessment() {

            return (
                window.NBHAS.completedAssessment ||
                null
            );

        },

        hasAssessment() {

            return !!this.getAssessment();

        },

        buildReportData() {

            const assessment =
                this.getAssessment();

            if (!assessment) {
                return null;
            }

            return {

                completedAt:
                    assessment.completedAt,

                category:
                    assessment.category,

                categoryGroup:
                    assessment.categoryGroup,

                answers:
                    assessment.answers,

                results:
                    assessment.results

            };

        }

    };

    window.NBHAS.report = REPORT;

})();