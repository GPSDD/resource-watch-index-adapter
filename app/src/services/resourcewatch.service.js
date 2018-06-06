const logger = require('logger');
const url = require('url');
const requestPromise = require('request-promise');
const config = require('config');
const ctRegisterMicroservice = require('ct-register-microservice-node');

class RWIndexService {

    static async cronUpdate() {
        try {
            logger.info('Running cron update');
            logger.debug('Obtaining datasets');
            const datasets = await ctRegisterMicroservice.requestToMicroservice({
                method: 'GET',
                uri: `/dataset?provider=resourcewatch&page[size]=99999&status=saved`,
                json: true
            });
            if (datasets && datasets.data) {
                for (let i = 0, length = datasets.data.length; i < length; i++) {
                    try {
                        const dataset = datasets.data[i].attributes;
                        dataset.id = datasets.data[i].id;
                        await RWIndexService.register(dataset, dataset.userId, true);
                    } catch (err) {
                        logger.error('Error updating dataset', err);
                    }
                }
            }
        } catch (err) {
            logger.error('Error in cronupdate', err);
            throw err;
        }
    }

    static async register(dataset, userId, update = false) {
        logger.debug(`Obtaining metadata of indicator ${dataset.tableName}`);

        logger.debug('Obtaining metadata of dataset ', `${config.resourcewatch.metadata}`.replace(':indicator', dataset.tableName));
        try {
            const data = await requestPromise({
                method: 'GET',
                url: `${config.resourcewatch.metadata}`.replace(':indicator', dataset.tableName),
                json: true
            });
            logger.debug('data', data);
            if (!data || data.length !== 2 || data[1].length !== 1) {
                throw new Error('Format not valid');
            }
            const rwMetadata = data[1][0];
            const metadata = {
                language: 'en',
                name: rwMetadata.name,
                description: rwMetadata.sourceNote,
                sourceOrganization: 'World Bank Group',
                dataSourceUrl: config.resourcewatch.dataSourceUrl.replace(':indicator', dataset.tableName),
                dataSourceEndpoint: config.resourcewatch.dataSourceEndpoint.replace(':indicator', dataset.tableName),
                status: 'published',
                license: 'CC-BY',
                userId,
                info: {
                    topics: rwMetadata.topics && Array.isArray(rwMetadata.topics) ? rwMetadata.topics.map(e => e.value) : []
                }
            };
            logger.debug('Saving metadata', metadata);
            if (!update) {
                await ctRegisterMicroservice.requestToMicroservice({
                    method: 'POST',
                    uri: `/dataset/${dataset.id}/metadata`,
                    body: metadata,
                    json: true
                });
            } else {
                await ctRegisterMicroservice.requestToMicroservice({
                    method: 'PATCH',
                    uri: `/dataset/${dataset.id}/metadata`,
                    body: metadata,
                    json: true
                });
            }

        } catch (err) {
            logger.error('Error obtaining metadata', err);
            throw new Error('Error obtaining metadata');
        }
    }

}

module.exports = RWIndexService;