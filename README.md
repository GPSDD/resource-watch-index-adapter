# Resource Watch Index Adapter


This repository is the microservice that implements the Resource Watch Index Adapter
functionality

1. [Getting Started](#getting-started)

## Getting Started

### OS X

**First, make sure that you have the [API gateway running
locally](https://github.com/control-tower/control-tower).**

We're using Docker which, luckily for you, means that getting the
application running locally should be fairly painless. First, make sure
that you have [Docker Compose](https://docs.docker.com/compose/install/)
installed on your machine.

```
git clone https://github.com/Vizzuality/gfw-geostore-api.git
cd resource-watch-index-adapter
./adapter.sh develop
```text

You can now access the microservice through the CT gateway.

```

### Configuration

It is necessary to define these environment variables:

* CT_URL => Control Tower URL
* NODE_ENV => Environment (prod, staging, dev)

### Cron task

This component executes a periodic task that updates the metadata of each indexed RW dataset. The task is bootstrapped  
[when the application server starts](https://github.com/GPSDD/resource-watch-index-adapter/blob/master/app/src/app.js#L19). 
The task's implementation can be found on `app/src/cron/cron` and the configuration is loaded from the 
[config files](https://github.com/GPSDD/resource-watch-index-adapter/blob/master/config/default.json#L18)



## Field correspondence


| Field in SDG Metadata     | Field in RW Metadata  | Value         |
|---------------------------|-----------------------|---------------|
| userId                    |                       |               |
| language                  |                       | 'en'          |
| resource                  |                       |               |
| name                      | name                  |               |
| description               | description           |               |
| sourceOrganization        |                       | 'Resource Watch' |
| dataDownloadUrl           |                       | '' with :dataset-id = id of dataset |
| dataSourceUrl             | source (prio1)        | (will depend on source app) (prio 2) |
| dataSourceEndpoint        |                       | 'https://api.resourcewatch.org/v2/countries/all/indicators/:indicator?format=json&per_page=30000' with :indicator = id of indicator|
| license                   | license               |               |
| info                      | info                  |               |
| status                    |                       | 'published'   |


## Dataset tagging strategy


### Taxonomy

RW datasets have tags associated with them, which this connector uses to tag the index datasets.
Additionally, each RW dataset is tagged with the "Resource Watch API" tag, and a tag to match 
[the RW API application to which they belong](https://github.com/GPSDD/resource-watch-index-adapter/blob/b5c32ee91018b60df56048b8df2b303787796bba/app/src/services/resourcewatch.service.js#L101).

### Graph

The RW API uses a graph taxonomy that is very similar to the one use in API Highways, so a string comparison based match
is attempted between RW API graph terms and AH API graph terms. 

