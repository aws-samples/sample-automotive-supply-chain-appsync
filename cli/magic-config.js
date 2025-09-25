#!/usr/bin/env node
"use strict";
// Copyright 2021 Amazon.com.
// SPDX-License-Identifier: MIT
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const enquirer = require("enquirer");
const types_1 = require("../lib/shared/types");
const version_js_1 = require("./version.js");
const fs = require("fs");
const aws_cron_validator_1 = require("./aws-cron-validator");
const moment_timezone_1 = require("moment-timezone");
const country_list_1 = require("country-list");
function getTimeZonesWithCurrentTime() {
    const timeZones = moment_timezone_1.tz.names(); // Get a list of all timezones
    const timeZoneData = timeZones.map((zone) => {
        // Get current time in each timezone
        const currentTime = (0, moment_timezone_1.tz)(zone).format("YYYY-MM-DD HH:mm");
        return { message: `${zone}: ${currentTime}`, name: zone };
    });
    return timeZoneData;
}
function getCountryCodesAndNames() {
    // Use country-list to get an array of countries with their codes and names
    const countries = (0, country_list_1.getData)();
    // Map the country data to match the desired output structure
    const countryInfo = countries.map(({ code, name }) => {
        return { message: `${name} (${code})`, name: code };
    });
    return countryInfo;
}
function isValidDate(dateString) {
    // Check the pattern YYYY/MM/DD
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!regex.test(dateString)) {
        return false;
    }
    // Parse the date parts to integers
    const parts = dateString.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    // Check the date validity
    const date = new Date(year, month, day);
    if (date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day) {
        return false;
    }
    // Check if the date is in the future compared to the current date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date <= today) {
        return false;
    }
    return true;
}
const timeZoneData = getTimeZonesWithCurrentTime();
const cfCountries = getCountryCodesAndNames();
const iamRoleRegExp = RegExp(/arn:aws:iam::\d+:role\/[\w-_]+/);
const acmCertRegExp = RegExp(/arn:aws:acm:[\w-_]+:\d+:certificate\/[\w-_]+/);
const cfAcmCertRegExp = RegExp(/arn:aws:acm:us-east-1:\d+:certificate\/[\w-_]+/);
const kendraIdRegExp = RegExp(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
const secretManagerArnRegExp = RegExp(/arn:aws:secretsmanager:[\w-_]+:\d+:secret:[\w-_]+/);
const embeddingModels = [
    {
        provider: "sagemaker",
        name: "intfloat/multilingual-e5-large",
        dimensions: 1024,
    },
    {
        provider: "sagemaker",
        name: "sentence-transformers/all-MiniLM-L6-v2",
        dimensions: 384,
    },
    {
        provider: "bedrock",
        name: "amazon.titan-embed-text-v1",
        dimensions: 1536,
    },
    //Support for inputImage is not yet implemented for amazon.titan-embed-image-v1
    {
        provider: "bedrock",
        name: "amazon.titan-embed-image-v1",
        dimensions: 1024,
    },
    {
        provider: "bedrock",
        name: "cohere.embed-english-v3",
        dimensions: 1024,
    },
    {
        provider: "bedrock",
        name: "cohere.embed-multilingual-v3",
        dimensions: 1024,
    },
    {
        provider: "openai",
        name: "text-embedding-ada-002",
        dimensions: 1536,
    },
];
/**
 * Main entry point
 */
(async () => {
    let program = new commander_1.Command().description("Creates a new chatbot configuration");
    program.version(version_js_1.LIB_VERSION);
    program.option("-p, --prefix <prefix>", "The prefix for the stack");
    program.action(async (options) => {
        if (fs.existsSync("./bin/config.json")) {
            const config = JSON.parse(fs.readFileSync("./bin/config.json").toString("utf8"));
            options.prefix = config.prefix;
            options.vpcId = config.vpc?.vpcId;
            options.createVpcEndpoints = config.vpc?.createVpcEndpoints;
            options.privateWebsite = config.privateWebsite;
            options.certificate = config.certificate;
            options.domain = config.domain;
            options.cfGeoRestrictEnable = config.cfGeoRestrictEnable;
            options.cfGeoRestrictList = config.cfGeoRestrictList;
            options.bedrockEnable = config.bedrock?.enabled;
            options.bedrockRegion = config.bedrock?.region;
            options.bedrockRoleArn = config.bedrock?.roleArn;
            options.sagemakerModels = config.llms?.sagemaker ?? [];
            options.enableSagemakerModels = config.llms?.sagemaker
                ? config.llms?.sagemaker.length > 0
                : false;
            options.huggingfaceApiSecretArn = config.llms?.huggingfaceApiSecretArn;
            options.enableSagemakerModelsSchedule =
                config.llms?.sagemakerSchedule?.enabled;
            options.timezonePicker = config.llms?.sagemakerSchedule?.timezonePicker;
            options.enableCronFormat =
                config.llms?.sagemakerSchedule?.enableCronFormat;
            options.cronSagemakerModelsScheduleStart =
                config.llms?.sagemakerSchedule?.sagemakerCronStartSchedule;
            options.cronSagemakerModelsScheduleStop =
                config.llms?.sagemakerSchedule?.sagemakerCronStopSchedule;
            options.daysForSchedule = config.llms?.sagemakerSchedule?.daysForSchedule;
            options.scheduleStartTime =
                config.llms?.sagemakerSchedule?.scheduleStartTime;
            options.scheduleStopTime =
                config.llms?.sagemakerSchedule?.scheduleStopTime;
            options.enableScheduleEndDate =
                config.llms?.sagemakerSchedule?.enableScheduleEndDate;
            options.startScheduleEndDate =
                config.llms?.sagemakerSchedule?.startScheduleEndDate;
            options.enableRag = config.rag.enabled;
            options.ragsToEnable = Object.keys(config.rag.engines ?? {}).filter((v) => config.rag.engines[v].enabled);
            if (options.ragsToEnable.includes("kendra") &&
                !config.rag.engines.kendra.createIndex) {
                options.ragsToEnable.pop("kendra");
            }
            options.embeddings = config.rag.embeddingsModels.map((m) => m.name);
            options.defaultEmbedding = (config.rag.embeddingsModels ?? []).filter((m) => m.default)[0].name;
            options.kendraExternal = config.rag.engines.kendra.external;
            options.kendraEnterprise = config.rag.engines.kendra.enterprise;
        }
        try {
            await processCreateOptions(options);
        }
        catch (err) {
            console.error("Could not complete the operation.");
            console.error(err.message);
            process.exit(1);
        }
    });
    program.parse(process.argv);
})();
function createConfig(config) {
    fs.writeFileSync("./bin/config.json", JSON.stringify(config, undefined, 2));
    console.log("Configuration written to ./bin/config.json");
}
/**
 * Prompts the user for missing options
 *
 * @param options Options provided via the CLI
 * @returns The complete options
 */
async function processCreateOptions(options) {
    let questions = [
        {
            type: "input",
            name: "prefix",
            message: "Prefix to differentiate this deployment",
            initial: options.prefix,
            askAnswered: false,
        },
        {
            type: "confirm",
            name: "existingVpc",
            message: "Do you want to use existing vpc? (selecting false will create a new vpc)",
            initial: options.vpcId ? true : false,
        },
        {
            type: "input",
            name: "vpcId",
            message: "Specify existing VpcId (vpc-xxxxxxxxxxxxxxxxx)",
            initial: options.vpcId,
            validate(vpcId) {
                return this.skipped ||
                    RegExp(/^vpc-[0-9a-f]{8,17}$/i).test(vpcId)
                    ? true
                    : "Enter a valid VpcId in vpc-xxxxxxxxxxx format";
            },
            skip() {
                return !this.state.answers.existingVpc;
            },
        },
        {
            type: "confirm",
            name: "createVpcEndpoints",
            message: "Do you want create VPC Endpoints?",
            initial: options.createVpcEndpoints || false,
            skip() {
                return !this.state.answers.existingVpc;
            },
        },
        {
            type: "confirm",
            name: "privateWebsite",
            message: "Do you want to deploy a private website? I.e only accessible in VPC",
            initial: options.privateWebsite || false,
        },
        {
            type: "confirm",
            name: "customPublicDomain",
            message: "Do you want to provide a custom domain name and corresponding certificate arn for the public website ?",
            initial: options.customPublicDomain || false,
            skip() {
                return this.state.answers.privateWebsite;
            },
        },
        {
            type: "input",
            name: "certificate",
            validate(v) {
                if (this.state.answers.privateWebsite) {
                    const valid = acmCertRegExp.test(v);
                    return this.skipped || valid
                        ? true
                        : "You need to enter an ACM certificate arn";
                }
                else {
                    const valid = cfAcmCertRegExp.test(v);
                    return this.skipped || valid
                        ? true
                        : "You need to enter an ACM certificate arn in us-east-1 for CF";
                }
            },
            message() {
                if (this.state.answers.customPublicDomain) {
                    return "ACM certificate ARN with custom domain for public website. Note that the certificate must resides in us-east-1";
                }
                return "ACM certificate ARN";
            },
            initial: options.certificate,
            skip() {
                return (!this.state.answers.privateWebsite &&
                    !this.state.answers.customPublicDomain);
            },
        },
        {
            type: "input",
            name: "domain",
            message() {
                if (this.state.answers.customPublicDomain) {
                    return "Custom Domain for public website i.e example.com";
                }
                return "Domain for private website i.e example.com";
            },
            validate(v) {
                return this.skipped || v.length > 0
                    ? true
                    : "You need to enter a domain name";
            },
            initial: options.domain,
            skip() {
                return (!this.state.answers.privateWebsite &&
                    !this.state.answers.customPublicDomain);
            },
        },
        {
            type: "confirm",
            name: "cfGeoRestrictEnable",
            message: "Do want to restrict access to the website (CF Distribution) to only a country or countries?",
            initial: options.cfGeoRestrictEnable || false,
            skip() {
                return this.state.answers.privateWebsite;
            },
        },
        {
            type: "multiselect",
            name: "cfGeoRestrictList",
            hint: "SPACE to select, ENTER to confirm selection",
            message: "Which countries do you wish to ALLOW access?",
            choices: cfCountries,
            validate(choices) {
                return this.skipped || choices.length > 0
                    ? true
                    : "You need to select at least one country";
            },
            skip() {
                this.state._choices = this.state.choices;
                return (!this.state.answers.cfGeoRestrictEnable ||
                    this.state.answers.privateWebsite);
            },
            initial: options.cfGeoRestrictList || [],
        },
        {
            type: "confirm",
            name: "bedrockEnable",
            message: "Do you have access to Bedrock and want to enable it",
            initial: true,
        },
        {
            type: "select",
            name: "bedrockRegion",
            message: "Region where Bedrock is available",
            choices: Object.values(types_1.SupportedBedrockRegion),
            initial: options.bedrockRegion ?? "us-east-1",
            skip() {
                return !this.state.answers.bedrockEnable;
            },
        },
        {
            type: "input",
            name: "bedrockRoleArn",
            message: "Cross account role arn to invoke Bedrock - leave empty if Bedrock is in same account",
            validate: (v) => {
                const valid = iamRoleRegExp.test(v);
                return v.length === 0 || valid;
            },
            initial: options.bedrockRoleArn || "",
        },
        {
            type: "confirm",
            name: "enableSagemakerModels",
            message: "Do you want to use any Sagemaker Models",
            initial: options.enableSagemakerModels || false,
        },
        {
            type: "multiselect",
            name: "sagemakerModels",
            hint: "SPACE to select, ENTER to confirm selection [denotes instance size to host model]",
            message: "Which SageMaker Models do you want to enable",
            choices: Object.values(types_1.SupportedSageMakerModels),
            initial: (options.sagemakerModels ?? []).filter((m) => Object.values(types_1.SupportedSageMakerModels)
                .map((x) => x.toString())
                .includes(m)) || [],
            validate(choices) {
                //Trap for new players, validate always runs even if skipped is true
                // So need to handle validate bail out if skipped is true
                return this.skipped || choices.length > 0
                    ? true
                    : "You need to select at least one model";
            },
            skip() {
                this.state._choices = this.state.choices;
                return !this.state.answers.enableSagemakerModels;
            },
        },
        {
            type: "input",
            name: "huggingfaceApiSecretArn",
            message: "Some HuggingFace models including mistral now require an API key, Please enter an Secrets Manager Secret ARN (see docs: Model Requirements)",
            validate: (v) => {
                const valid = secretManagerArnRegExp.test(v);
                return v.length === 0 || valid
                    ? true
                    : "If you are supplying a HF API key it needs to be a reference to a secrets manager secret ARN";
            },
            initial: options.huggingfaceApiSecretArn || "",
            skip() {
                return !this.state.answers.enableSagemakerModels;
            },
        },
        {
            type: "confirm",
            name: "enableSagemakerModelsSchedule",
            message: "Do you want to enable a start/stop schedule for sagemaker models?",
            initial() {
                return ((options.enableSagemakerModelsSchedule &&
                    this.state.answers.enableSagemakerModels) ||
                    false);
            },
            skip() {
                return !this.state.answers.enableSagemakerModels;
            },
        },
        {
            type: "AutoComplete",
            name: "timezonePicker",
            hint: "start typing to auto complete, ENTER to confirm selection",
            message: "Which TimeZone do you want to run the schedule in?",
            choices: timeZoneData,
            validate(choices) {
                return this.skipped || choices.length > 0
                    ? true
                    : "You need to select at least one time zone";
            },
            skip() {
                return !this.state.answers.enableSagemakerModelsSchedule;
            },
            initial: options.timezonePicker || [],
        },
        {
            type: "select",
            name: "enableCronFormat",
            choices: [
                { message: "Simple - Wizard lead", name: "simple" },
                { message: "Advanced - Provide cron expression", name: "cron" },
            ],
            message: "How do you want to set the schedule?",
            initial: options.enableCronFormat || "",
            skip() {
                this.state._choices = this.state.choices;
                return !this.state.answers.enableSagemakerModelsSchedule;
            },
        },
        {
            type: "input",
            name: "sagemakerCronStartSchedule",
            hint: "This cron format is using AWS eventbridge cron syntax see docs for more information",
            message: "Start schedule for Sagmaker models expressed in UTC AWS cron format",
            skip() {
                return !this.state.answers.enableCronFormat.includes("cron");
            },
            validate(v) {
                if (this.skipped) {
                    return true;
                }
                try {
                    aws_cron_validator_1.AWSCronValidator.validate(v);
                    return true;
                }
                catch (error) {
                    if (error instanceof Error) {
                        return error.message;
                    }
                    return false;
                }
            },
            initial: options.cronSagemakerModelsScheduleStart,
        },
        {
            type: "input",
            name: "sagemakerCronStopSchedule",
            hint: "This cron format is using AWS eventbridge cron syntax see docs for more information",
            message: "Stop schedule for Sagmaker models expressed in AWS cron format",
            skip() {
                return !this.state.answers.enableCronFormat.includes("cron");
            },
            validate(v) {
                if (this.skipped) {
                    return true;
                }
                try {
                    aws_cron_validator_1.AWSCronValidator.validate(v);
                    return true;
                }
                catch (error) {
                    if (error instanceof Error) {
                        return error.message;
                    }
                    return false;
                }
            },
            initial: options.cronSagemakerModelsScheduleStop,
        },
        {
            type: "multiselect",
            name: "daysForSchedule",
            hint: "SPACE to select, ENTER to confirm selection",
            message: "Which days of the week would you like to run the schedule on?",
            choices: [
                { message: "Sunday", name: "SUN" },
                { message: "Monday", name: "MON" },
                { message: "Tuesday", name: "TUE" },
                { message: "Wednesday", name: "WED" },
                { message: "Thursday", name: "THU" },
                { message: "Friday", name: "FRI" },
                { message: "Saturday", name: "SAT" },
            ],
            validate(choices) {
                return this.skipped || choices.length > 0
                    ? true
                    : "You need to select at least one day";
            },
            skip() {
                this.state._choices = this.state.choices;
                if (!this.state.answers.enableSagemakerModelsSchedule) {
                    return true;
                }
                return !this.state.answers.enableCronFormat.includes("simple");
            },
            initial: options.daysForSchedule || [],
        },
        {
            type: "input",
            name: "scheduleStartTime",
            message: "What time of day do you wish to run the start schedule? enter in HH:MM format",
            validate(v) {
                if (this.skipped) {
                    return true;
                }
                // Regular expression to match HH:MM format
                const regex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
                return regex.test(v) || "Time must be in HH:MM format!";
            },
            skip() {
                if (!this.state.answers.enableSagemakerModelsSchedule) {
                    return true;
                }
                return !this.state.answers.enableCronFormat.includes("simple");
            },
            initial: options.scheduleStartTime,
        },
        {
            type: "input",
            name: "scheduleStopTime",
            message: "What time of day do you wish to run the stop schedule? enter in HH:MM format",
            validate(v) {
                if (this.skipped) {
                    return true;
                }
                // Regular expression to match HH:MM format
                const regex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
                return regex.test(v) || "Time must be in HH:MM format!";
            },
            skip() {
                if (!this.state.answers.enableSagemakerModelsSchedule) {
                    return true;
                }
                return !this.state.answers.enableCronFormat.includes("simple");
            },
            initial: options.scheduleStopTime,
        },
        {
            type: "confirm",
            name: "enableScheduleEndDate",
            message: "Would you like to set an end data for the start schedule? (after this date the models would no longer start)",
            initial: options.enableScheduleEndDate || false,
            skip() {
                return !this.state.answers.enableSagemakerModelsSchedule;
            },
        },
        {
            type: "input",
            name: "startScheduleEndDate",
            message: "After this date the models will no longer start",
            hint: "YYYY-MM-DD",
            validate(v) {
                if (this.skipped) {
                    return true;
                }
                return (isValidDate(v) ||
                    "The date must be in format YYYY/MM/DD and be in the future");
            },
            skip() {
                return !this.state.answers.enableScheduleEndDate;
            },
            initial: options.startScheduleEndDate || false,
        },
        {
            type: "confirm",
            name: "enableRag",
            message: "Do you want to enable RAG",
            initial: options.enableRag || false,
        },
        {
            type: "multiselect",
            name: "ragsToEnable",
            hint: "SPACE to select, ENTER to confirm selection",
            message: "Which datastores do you want to enable for RAG",
            choices: [
                { message: "Aurora", name: "aurora" },
                { message: "OpenSearch", name: "opensearch" },
                { message: "Kendra (managed)", name: "kendra" },
            ],
            validate(choices) {
                return this.skipped || choices.length > 0
                    ? true
                    : "You need to select at least one engine";
            },
            skip() {
                // workaround for https://github.com/enquirer/enquirer/issues/298
                this.state._choices = this.state.choices;
                return !this.state.answers.enableRag;
            },
            initial: options.ragsToEnable || [],
        },
        {
            type: "confirm",
            name: "kendraEnterprise",
            message: "Do you want to enable Kendra Enterprise Edition?",
            initial: options.kendraEnterprise || false,
            skip() {
                return !this.state.answers.ragsToEnable.includes("kendra");
            },
        },
        {
            type: "confirm",
            name: "kendra",
            message: "Do you want to add existing Kendra indexes",
            initial: (options.kendraExternal !== undefined &&
                options.kendraExternal.length > 0) ||
                false,
            skip() {
                if (!this.state.answers.enableRag) {
                    return true;
                }
                return !this.state.answers.ragsToEnable.includes("kendra");
            },
        },
    ];
    const answers = await enquirer.prompt(questions);
    const kendraExternal = [];
    let newKendra = answers.enableRag && answers.kendra;
    const existingKendraIndices = Array.from(options.kendraExternal || []);
    while (newKendra === true) {
        let existingIndex = existingKendraIndices.pop();
        const kendraQ = [
            {
                type: "input",
                name: "name",
                message: "Kendra source name",
                validate(v) {
                    return RegExp(/^\w[\w-_]*\w$/).test(v);
                },
                initial: existingIndex?.name,
            },
            {
                type: "autocomplete",
                limit: 8,
                name: "region",
                choices: Object.values(types_1.SupportedRegion),
                message: `Region of the Kendra index${existingIndex?.region ? " (" + existingIndex?.region + ")" : ""}`,
                initial: Object.values(types_1.SupportedRegion).indexOf(existingIndex?.region),
            },
            {
                type: "input",
                name: "roleArn",
                message: "Cross account role Arn to assume to call Kendra, leave empty if not needed",
                validate: (v) => {
                    const valid = iamRoleRegExp.test(v);
                    return v.length === 0 || valid;
                },
                initial: existingIndex?.roleArn ?? "",
            },
            {
                type: "input",
                name: "kendraId",
                message: "Kendra ID",
                validate(v) {
                    return kendraIdRegExp.test(v);
                },
                initial: existingIndex?.kendraId,
            },
            {
                type: "confirm",
                name: "enabled",
                message: "Enable this index",
                initial: existingIndex?.enabled ?? true,
            },
            {
                type: "confirm",
                name: "newKendra",
                message: "Do you want to add another Kendra source",
                initial: false,
            },
        ];
        const kendraInstance = await enquirer.prompt(kendraQ);
        const ext = (({ enabled, name, roleArn, kendraId, region }) => ({
            enabled,
            name,
            roleArn,
            kendraId,
            region,
        }))(kendraInstance);
        if (ext.roleArn === "")
            ext.roleArn = undefined;
        kendraExternal.push({
            ...ext,
        });
        newKendra = kendraInstance.newKendra;
    }
    const modelsPrompts = [
        {
            type: "select",
            name: "defaultEmbedding",
            message: "Select a default embedding model",
            choices: embeddingModels.map((m) => ({ name: m.name, value: m })),
            initial: options.defaultEmbedding,
            validate(value) {
                if (this.state.answers.enableRag) {
                    return value ? true : "Select a default embedding model";
                }
                return true;
            },
            skip() {
                return (!answers.enableRag ||
                    !(answers.ragsToEnable.includes("aurora") ||
                        answers.ragsToEnable.includes("opensearch")));
            },
        },
    ];
    const models = await enquirer.prompt(modelsPrompts);
    // Convert simple time into cron format for schedule
    if (answers.enableSagemakerModelsSchedule &&
        answers.enableCronFormat == "simple") {
        const daysToRunSchedule = answers.daysForSchedule.join(",");
        const startMinutes = answers.scheduleStartTime.split(":")[1];
        const startHour = answers.scheduleStartTime.split(":")[0];
        answers.sagemakerCronStartSchedule = `${startMinutes} ${startHour} ? * ${daysToRunSchedule} *`;
        aws_cron_validator_1.AWSCronValidator.validate(answers.sagemakerCronStartSchedule);
        const stopMinutes = answers.scheduleStopTime.split(":")[1];
        const stopHour = answers.scheduleStopTime.split(":")[0];
        answers.sagemakerCronStopSchedule = `${stopMinutes} ${stopHour} ? * ${daysToRunSchedule} *`;
        aws_cron_validator_1.AWSCronValidator.validate(answers.sagemakerCronStopSchedule);
    }
    // Create the config object
    const config = {
        prefix: answers.prefix,
        vpc: answers.existingVpc
            ? {
                vpcId: answers.vpcId.toLowerCase(),
                createVpcEndpoints: answers.createVpcEndpoints,
            }
            : undefined,
        privateWebsite: answers.privateWebsite,
        certificate: answers.certificate,
        domain: answers.domain,
        cfGeoRestrictEnable: answers.cfGeoRestrictEnable,
        cfGeoRestrictList: answers.cfGeoRestrictList,
        bedrock: answers.bedrockEnable
            ? {
                enabled: answers.bedrockEnable,
                region: answers.bedrockRegion,
                roleArn: answers.bedrockRoleArn === "" ? undefined : answers.bedrockRoleArn,
            }
            : undefined,
        llms: {
            sagemaker: answers.sagemakerModels,
            huggingfaceApiSecretArn: answers.huggingfaceApiSecretArn,
            sagemakerSchedule: answers.enableSagemakerModelsSchedule
                ? {
                    enabled: answers.enableSagemakerModelsSchedule,
                    timezonePicker: answers.timezonePicker,
                    enableCronFormat: answers.enableCronFormat,
                    sagemakerCronStartSchedule: answers.sagemakerCronStartSchedule,
                    sagemakerCronStopSchedule: answers.sagemakerCronStopSchedule,
                    daysForSchedule: answers.daysForSchedule,
                    scheduleStartTime: answers.scheduleStartTime,
                    scheduleStopTime: answers.scheduleStopTime,
                    enableScheduleEndDate: answers.enableScheduleEndDate,
                    startScheduleEndDate: answers.startScheduleEndDate,
                }
                : undefined,
        },
        rag: {
            enabled: answers.enableRag,
            engines: {
                aurora: {
                    enabled: answers.ragsToEnable.includes("aurora"),
                },
                opensearch: {
                    enabled: answers.ragsToEnable.includes("opensearch"),
                },
                kendra: {
                    enabled: false,
                    createIndex: false,
                    external: [{}],
                    enterprise: false,
                },
            },
            embeddingsModels: [{}],
            crossEncoderModels: [{}],
        },
    };
    // If we have not enabled rag the default embedding is set to the first model
    if (!answers.enableRag) {
        models.defaultEmbedding = embeddingModels[0].name;
    }
    config.rag.crossEncoderModels[0] = {
        provider: "sagemaker",
        name: "cross-encoder/ms-marco-MiniLM-L-12-v2",
        default: true,
    };
    config.rag.embeddingsModels = embeddingModels;
    config.rag.embeddingsModels.forEach((m) => {
        if (m.name === models.defaultEmbedding) {
            m.default = true;
        }
    });
    config.rag.engines.kendra.createIndex =
        answers.ragsToEnable.includes("kendra");
    config.rag.engines.kendra.enabled =
        config.rag.engines.kendra.createIndex || kendraExternal.length > 0;
    config.rag.engines.kendra.external = [...kendraExternal];
    config.rag.engines.kendra.enterprise = answers.kendraEnterprise;
    console.log("\n✨ This is the chosen configuration:\n");
    console.log(JSON.stringify(config, undefined, 2));
    (await enquirer.prompt([
        {
            type: "confirm",
            name: "create",
            message: "Do you want to create/update the configuration based on the above settings",
            initial: true,
        },
    ])).create
        ? createConfig(config)
        : console.log("Skipping");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFnaWMtY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibWFnaWMtY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsNkJBQTZCO0FBQzdCLCtCQUErQjs7QUFFL0IseUNBQW9DO0FBQ3BDLHFDQUFxQztBQUNyQywrQ0FLNkI7QUFDN0IsNkNBQTJDO0FBQzNDLHlCQUF5QjtBQUN6Qiw2REFBd0Q7QUFDeEQscURBQXFDO0FBQ3JDLCtDQUF1QztBQUV2QyxTQUFTLDJCQUEyQjtJQUNsQyxNQUFNLFNBQVMsR0FBRyxvQkFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsOEJBQThCO0lBQzVELE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUMxQyxvQ0FBb0M7UUFDcEMsTUFBTSxXQUFXLEdBQUcsSUFBQSxvQkFBRSxFQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3hELE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLEtBQUssV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO0lBQzVELENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQUVELFNBQVMsdUJBQXVCO0lBQzlCLDJFQUEyRTtJQUMzRSxNQUFNLFNBQVMsR0FBRyxJQUFBLHNCQUFPLEdBQUUsQ0FBQztJQUU1Qiw2REFBNkQ7SUFDN0QsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7UUFDbkQsT0FBTyxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksS0FBSyxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDdEQsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLFdBQVcsQ0FBQztBQUNyQixDQUFD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SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXO1FBQ25DLE9BQU8sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPO1FBQy9CLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLElBQUksY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDckUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUM7SUFDekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7SUFFaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFaEQsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDckI7WUFDRSxJQUFJLEVBQUUsU0FBUztZQUNmLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUNMLDRFQUE0RTtZQUM5RSxPQUFPLEVBQUUsSUFBSTtTQUNkO0tBQ0YsQ0FBQyxDQUNILENBQUMsTUFBTTtRQUNOLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbi8vIENvcHlyaWdodCAyMDIxIEFtYXpvbi5jb20uXG4vLyBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogTUlUXG5cbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiY29tbWFuZGVyXCI7XG5pbXBvcnQgKiBhcyBlbnF1aXJlciBmcm9tIFwiZW5xdWlyZXJcIjtcbmltcG9ydCB7XG4gIFN1cHBvcnRlZFJlZ2lvbixcbiAgU3VwcG9ydGVkU2FnZU1ha2VyTW9kZWxzLFxuICBTeXN0ZW1Db25maWcsXG4gIFN1cHBvcnRlZEJlZHJvY2tSZWdpb24sXG59IGZyb20gXCIuLi9saWIvc2hhcmVkL3R5cGVzXCI7XG5pbXBvcnQgeyBMSUJfVkVSU0lPTiB9IGZyb20gXCIuL3ZlcnNpb24uanNcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgQVdTQ3JvblZhbGlkYXRvciB9IGZyb20gXCIuL2F3cy1jcm9uLXZhbGlkYXRvclwiO1xuaW1wb3J0IHsgdHogfSBmcm9tIFwibW9tZW50LXRpbWV6b25lXCI7XG5pbXBvcnQgeyBnZXREYXRhIH0gZnJvbSBcImNvdW50cnktbGlzdFwiO1xuXG5mdW5jdGlvbiBnZXRUaW1lWm9uZXNXaXRoQ3VycmVudFRpbWUoKTogeyBtZXNzYWdlOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9W10ge1xuICBjb25zdCB0aW1lWm9uZXMgPSB0ei5uYW1lcygpOyAvLyBHZXQgYSBsaXN0IG9mIGFsbCB0aW1lem9uZXNcbiAgY29uc3QgdGltZVpvbmVEYXRhID0gdGltZVpvbmVzLm1hcCgoem9uZSkgPT4ge1xuICAgIC8vIEdldCBjdXJyZW50IHRpbWUgaW4gZWFjaCB0aW1lem9uZVxuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gdHooem9uZSkuZm9ybWF0KFwiWVlZWS1NTS1ERCBISDptbVwiKTtcbiAgICByZXR1cm4geyBtZXNzYWdlOiBgJHt6b25lfTogJHtjdXJyZW50VGltZX1gLCBuYW1lOiB6b25lIH07XG4gIH0pO1xuICByZXR1cm4gdGltZVpvbmVEYXRhO1xufVxuXG5mdW5jdGlvbiBnZXRDb3VudHJ5Q29kZXNBbmROYW1lcygpOiB7IG1lc3NhZ2U6IHN0cmluZzsgbmFtZTogc3RyaW5nIH1bXSB7XG4gIC8vIFVzZSBjb3VudHJ5LWxpc3QgdG8gZ2V0IGFuIGFycmF5IG9mIGNvdW50cmllcyB3aXRoIHRoZWlyIGNvZGVzIGFuZCBuYW1lc1xuICBjb25zdCBjb3VudHJpZXMgPSBnZXREYXRhKCk7XG5cbiAgLy8gTWFwIHRoZSBjb3VudHJ5IGRhdGEgdG8gbWF0Y2ggdGhlIGRlc2lyZWQgb3V0cHV0IHN0cnVjdHVyZVxuICBjb25zdCBjb3VudHJ5SW5mbyA9IGNvdW50cmllcy5tYXAoKHsgY29kZSwgbmFtZSB9KSA9PiB7XG4gICAgcmV0dXJuIHsgbWVzc2FnZTogYCR7bmFtZX0gKCR7Y29kZX0pYCwgbmFtZTogY29kZSB9O1xuICB9KTtcbiAgcmV0dXJuIGNvdW50cnlJbmZvO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkRGF0ZShkYXRlU3RyaW5nOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgLy8gQ2hlY2sgdGhlIHBhdHRlcm4gWVlZWS9NTS9ERFxuICBjb25zdCByZWdleCA9IC9eXFxkezR9LSgwWzEtOV18MVswLTJdKS0oMFsxLTldfFsxMl1bMC05XXwzWzAxXSkkLztcbiAgaWYgKCFyZWdleC50ZXN0KGRhdGVTdHJpbmcpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gUGFyc2UgdGhlIGRhdGUgcGFydHMgdG8gaW50ZWdlcnNcbiAgY29uc3QgcGFydHMgPSBkYXRlU3RyaW5nLnNwbGl0KFwiLVwiKTtcbiAgY29uc3QgeWVhciA9IHBhcnNlSW50KHBhcnRzWzBdLCAxMCk7XG4gIGNvbnN0IG1vbnRoID0gcGFyc2VJbnQocGFydHNbMV0sIDEwKSAtIDE7IC8vIE1vbnRoIGlzIDAtaW5kZXhlZFxuICBjb25zdCBkYXkgPSBwYXJzZUludChwYXJ0c1syXSwgMTApO1xuXG4gIC8vIENoZWNrIHRoZSBkYXRlIHZhbGlkaXR5XG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF5KTtcbiAgaWYgKFxuICAgIGRhdGUuZ2V0RnVsbFllYXIoKSAhPT0geWVhciB8fFxuICAgIGRhdGUuZ2V0TW9udGgoKSAhPT0gbW9udGggfHxcbiAgICBkYXRlLmdldERhdGUoKSAhPT0gZGF5XG4gICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHRoZSBkYXRlIGlzIGluIHRoZSBmdXR1cmUgY29tcGFyZWQgdG8gdGhlIGN1cnJlbnQgZGF0ZSBhdCAwMDowMDowMFxuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIHRvZGF5LnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICBpZiAoZGF0ZSA8PSB0b2RheSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5jb25zdCB0aW1lWm9uZURhdGEgPSBnZXRUaW1lWm9uZXNXaXRoQ3VycmVudFRpbWUoKTtcbmNvbnN0IGNmQ291bnRyaWVzID0gZ2V0Q291bnRyeUNvZGVzQW5kTmFtZXMoKTtcblxuY29uc3QgaWFtUm9sZVJlZ0V4cCA9IFJlZ0V4cCgvYXJuOmF3czppYW06OlxcZCs6cm9sZVxcL1tcXHctX10rLyk7XG5jb25zdCBhY21DZXJ0UmVnRXhwID0gUmVnRXhwKC9hcm46YXdzOmFjbTpbXFx3LV9dKzpcXGQrOmNlcnRpZmljYXRlXFwvW1xcdy1fXSsvKTtcbmNvbnN0IGNmQWNtQ2VydFJlZ0V4cCA9IFJlZ0V4cChcbiAgL2Fybjphd3M6YWNtOnVzLWVhc3QtMTpcXGQrOmNlcnRpZmljYXRlXFwvW1xcdy1fXSsvXG4pO1xuY29uc3Qga2VuZHJhSWRSZWdFeHAgPSBSZWdFeHAoL15cXHd7OH0tXFx3ezR9LVxcd3s0fS1cXHd7NH0tXFx3ezEyfSQvKTtcbmNvbnN0IHNlY3JldE1hbmFnZXJBcm5SZWdFeHAgPSBSZWdFeHAoXG4gIC9hcm46YXdzOnNlY3JldHNtYW5hZ2VyOltcXHctX10rOlxcZCs6c2VjcmV0OltcXHctX10rL1xuKTtcblxuY29uc3QgZW1iZWRkaW5nTW9kZWxzID0gW1xuICB7XG4gICAgcHJvdmlkZXI6IFwic2FnZW1ha2VyXCIsXG4gICAgbmFtZTogXCJpbnRmbG9hdC9tdWx0aWxpbmd1YWwtZTUtbGFyZ2VcIixcbiAgICBkaW1lbnNpb25zOiAxMDI0LFxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwic2FnZW1ha2VyXCIsXG4gICAgbmFtZTogXCJzZW50ZW5jZS10cmFuc2Zvcm1lcnMvYWxsLU1pbmlMTS1MNi12MlwiLFxuICAgIGRpbWVuc2lvbnM6IDM4NCxcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcImJlZHJvY2tcIixcbiAgICBuYW1lOiBcImFtYXpvbi50aXRhbi1lbWJlZC10ZXh0LXYxXCIsXG4gICAgZGltZW5zaW9uczogMTUzNixcbiAgfSxcbiAgLy9TdXBwb3J0IGZvciBpbnB1dEltYWdlIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIGFtYXpvbi50aXRhbi1lbWJlZC1pbWFnZS12MVxuICB7XG4gICAgcHJvdmlkZXI6IFwiYmVkcm9ja1wiLFxuICAgIG5hbWU6IFwiYW1hem9uLnRpdGFuLWVtYmVkLWltYWdlLXYxXCIsXG4gICAgZGltZW5zaW9uczogMTAyNCxcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcImJlZHJvY2tcIixcbiAgICBuYW1lOiBcImNvaGVyZS5lbWJlZC1lbmdsaXNoLXYzXCIsXG4gICAgZGltZW5zaW9uczogMTAyNCxcbiAgfSxcbiAge1xuICAgIHByb3ZpZGVyOiBcImJlZHJvY2tcIixcbiAgICBuYW1lOiBcImNvaGVyZS5lbWJlZC1tdWx0aWxpbmd1YWwtdjNcIixcbiAgICBkaW1lbnNpb25zOiAxMDI0LFxuICB9LFxuICB7XG4gICAgcHJvdmlkZXI6IFwib3BlbmFpXCIsXG4gICAgbmFtZTogXCJ0ZXh0LWVtYmVkZGluZy1hZGEtMDAyXCIsXG4gICAgZGltZW5zaW9uczogMTUzNixcbiAgfSxcbl07XG5cbi8qKlxuICogTWFpbiBlbnRyeSBwb2ludFxuICovXG5cbihhc3luYyAoKSA9PiB7XG4gIGxldCBwcm9ncmFtID0gbmV3IENvbW1hbmQoKS5kZXNjcmlwdGlvbihcbiAgICBcIkNyZWF0ZXMgYSBuZXcgY2hhdGJvdCBjb25maWd1cmF0aW9uXCJcbiAgKTtcbiAgcHJvZ3JhbS52ZXJzaW9uKExJQl9WRVJTSU9OKTtcblxuICBwcm9ncmFtLm9wdGlvbihcIi1wLCAtLXByZWZpeCA8cHJlZml4PlwiLCBcIlRoZSBwcmVmaXggZm9yIHRoZSBzdGFja1wiKTtcblxuICBwcm9ncmFtLmFjdGlvbihhc3luYyAob3B0aW9ucykgPT4ge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKFwiLi9iaW4vY29uZmlnLmpzb25cIikpIHtcbiAgICAgIGNvbnN0IGNvbmZpZzogU3lzdGVtQ29uZmlnID0gSlNPTi5wYXJzZShcbiAgICAgICAgZnMucmVhZEZpbGVTeW5jKFwiLi9iaW4vY29uZmlnLmpzb25cIikudG9TdHJpbmcoXCJ1dGY4XCIpXG4gICAgICApO1xuICAgICAgb3B0aW9ucy5wcmVmaXggPSBjb25maWcucHJlZml4O1xuICAgICAgb3B0aW9ucy52cGNJZCA9IGNvbmZpZy52cGM/LnZwY0lkO1xuICAgICAgb3B0aW9ucy5jcmVhdGVWcGNFbmRwb2ludHMgPSBjb25maWcudnBjPy5jcmVhdGVWcGNFbmRwb2ludHM7XG4gICAgICBvcHRpb25zLnByaXZhdGVXZWJzaXRlID0gY29uZmlnLnByaXZhdGVXZWJzaXRlO1xuICAgICAgb3B0aW9ucy5jZXJ0aWZpY2F0ZSA9IGNvbmZpZy5jZXJ0aWZpY2F0ZTtcbiAgICAgIG9wdGlvbnMuZG9tYWluID0gY29uZmlnLmRvbWFpbjtcbiAgICAgIG9wdGlvbnMuY2ZHZW9SZXN0cmljdEVuYWJsZSA9IGNvbmZpZy5jZkdlb1Jlc3RyaWN0RW5hYmxlO1xuICAgICAgb3B0aW9ucy5jZkdlb1Jlc3RyaWN0TGlzdCA9IGNvbmZpZy5jZkdlb1Jlc3RyaWN0TGlzdDtcbiAgICAgIG9wdGlvbnMuYmVkcm9ja0VuYWJsZSA9IGNvbmZpZy5iZWRyb2NrPy5lbmFibGVkO1xuICAgICAgb3B0aW9ucy5iZWRyb2NrUmVnaW9uID0gY29uZmlnLmJlZHJvY2s/LnJlZ2lvbjtcbiAgICAgIG9wdGlvbnMuYmVkcm9ja1JvbGVBcm4gPSBjb25maWcuYmVkcm9jaz8ucm9sZUFybjtcbiAgICAgIG9wdGlvbnMuc2FnZW1ha2VyTW9kZWxzID0gY29uZmlnLmxsbXM/LnNhZ2VtYWtlciA/PyBbXTtcbiAgICAgIG9wdGlvbnMuZW5hYmxlU2FnZW1ha2VyTW9kZWxzID0gY29uZmlnLmxsbXM/LnNhZ2VtYWtlclxuICAgICAgICA/IGNvbmZpZy5sbG1zPy5zYWdlbWFrZXIubGVuZ3RoID4gMFxuICAgICAgICA6IGZhbHNlO1xuICAgICAgb3B0aW9ucy5odWdnaW5nZmFjZUFwaVNlY3JldEFybiA9IGNvbmZpZy5sbG1zPy5odWdnaW5nZmFjZUFwaVNlY3JldEFybjtcbiAgICAgIG9wdGlvbnMuZW5hYmxlU2FnZW1ha2VyTW9kZWxzU2NoZWR1bGUgPVxuICAgICAgICBjb25maWcubGxtcz8uc2FnZW1ha2VyU2NoZWR1bGU/LmVuYWJsZWQ7XG4gICAgICBvcHRpb25zLnRpbWV6b25lUGlja2VyID0gY29uZmlnLmxsbXM/LnNhZ2VtYWtlclNjaGVkdWxlPy50aW1lem9uZVBpY2tlcjtcbiAgICAgIG9wdGlvbnMuZW5hYmxlQ3JvbkZvcm1hdCA9XG4gICAgICAgIGNvbmZpZy5sbG1zPy5zYWdlbWFrZXJTY2hlZHVsZT8uZW5hYmxlQ3JvbkZvcm1hdDtcbiAgICAgIG9wdGlvbnMuY3JvblNhZ2VtYWtlck1vZGVsc1NjaGVkdWxlU3RhcnQgPVxuICAgICAgICBjb25maWcubGxtcz8uc2FnZW1ha2VyU2NoZWR1bGU/LnNhZ2VtYWtlckNyb25TdGFydFNjaGVkdWxlO1xuICAgICAgb3B0aW9ucy5jcm9uU2FnZW1ha2VyTW9kZWxzU2NoZWR1bGVTdG9wID1cbiAgICAgICAgY29uZmlnLmxsbXM/LnNhZ2VtYWtlclNjaGVkdWxlPy5zYWdlbWFrZXJDcm9uU3RvcFNjaGVkdWxlO1xuICAgICAgb3B0aW9ucy5kYXlzRm9yU2NoZWR1bGUgPSBjb25maWcubGxtcz8uc2FnZW1ha2VyU2NoZWR1bGU/LmRheXNGb3JTY2hlZHVsZTtcbiAgICAgIG9wdGlvbnMuc2NoZWR1bGVTdGFydFRpbWUgPVxuICAgICAgICBjb25maWcubGxtcz8uc2FnZW1ha2VyU2NoZWR1bGU/LnNjaGVkdWxlU3RhcnRUaW1lO1xuICAgICAgb3B0aW9ucy5zY2hlZHVsZVN0b3BUaW1lID1cbiAgICAgICAgY29uZmlnLmxsbXM/LnNhZ2VtYWtlclNjaGVkdWxlPy5zY2hlZHVsZVN0b3BUaW1lO1xuICAgICAgb3B0aW9ucy5lbmFibGVTY2hlZHVsZUVuZERhdGUgPVxuICAgICAgICBjb25maWcubGxtcz8uc2FnZW1ha2VyU2NoZWR1bGU/LmVuYWJsZVNjaGVkdWxlRW5kRGF0ZTtcbiAgICAgIG9wdGlvbnMuc3RhcnRTY2hlZHVsZUVuZERhdGUgPVxuICAgICAgICBjb25maWcubGxtcz8uc2FnZW1ha2VyU2NoZWR1bGU/LnN0YXJ0U2NoZWR1bGVFbmREYXRlO1xuICAgICAgb3B0aW9ucy5lbmFibGVSYWcgPSBjb25maWcucmFnLmVuYWJsZWQ7XG4gICAgICBvcHRpb25zLnJhZ3NUb0VuYWJsZSA9IE9iamVjdC5rZXlzKGNvbmZpZy5yYWcuZW5naW5lcyA/PyB7fSkuZmlsdGVyKFxuICAgICAgICAodjogc3RyaW5nKSA9PiAoY29uZmlnLnJhZy5lbmdpbmVzIGFzIGFueSlbdl0uZW5hYmxlZFxuICAgICAgKTtcbiAgICAgIGlmIChcbiAgICAgICAgb3B0aW9ucy5yYWdzVG9FbmFibGUuaW5jbHVkZXMoXCJrZW5kcmFcIikgJiZcbiAgICAgICAgIWNvbmZpZy5yYWcuZW5naW5lcy5rZW5kcmEuY3JlYXRlSW5kZXhcbiAgICAgICkge1xuICAgICAgICBvcHRpb25zLnJhZ3NUb0VuYWJsZS5wb3AoXCJrZW5kcmFcIik7XG4gICAgICB9XG4gICAgICBvcHRpb25zLmVtYmVkZGluZ3MgPSBjb25maWcucmFnLmVtYmVkZGluZ3NNb2RlbHMubWFwKChtOiBhbnkpID0+IG0ubmFtZSk7XG4gICAgICBvcHRpb25zLmRlZmF1bHRFbWJlZGRpbmcgPSAoY29uZmlnLnJhZy5lbWJlZGRpbmdzTW9kZWxzID8/IFtdKS5maWx0ZXIoXG4gICAgICAgIChtOiBhbnkpID0+IG0uZGVmYXVsdFxuICAgICAgKVswXS5uYW1lO1xuICAgICAgb3B0aW9ucy5rZW5kcmFFeHRlcm5hbCA9IGNvbmZpZy5yYWcuZW5naW5lcy5rZW5kcmEuZXh0ZXJuYWw7XG4gICAgICBvcHRpb25zLmtlbmRyYUVudGVycHJpc2UgPSBjb25maWcucmFnLmVuZ2luZXMua2VuZHJhLmVudGVycHJpc2U7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBwcm9jZXNzQ3JlYXRlT3B0aW9ucyhvcHRpb25zKTtcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBjb21wbGV0ZSB0aGUgb3BlcmF0aW9uLlwiKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfSk7XG5cbiAgcHJvZ3JhbS5wYXJzZShwcm9jZXNzLmFyZ3YpO1xufSkoKTtcblxuZnVuY3Rpb24gY3JlYXRlQ29uZmlnKGNvbmZpZzogYW55KTogdm9pZCB7XG4gIGZzLndyaXRlRmlsZVN5bmMoXCIuL2Jpbi9jb25maWcuanNvblwiLCBKU09OLnN0cmluZ2lmeShjb25maWcsIHVuZGVmaW5lZCwgMikpO1xuICBjb25zb2xlLmxvZyhcIkNvbmZpZ3VyYXRpb24gd3JpdHRlbiB0byAuL2Jpbi9jb25maWcuanNvblwiKTtcbn1cblxuLyoqXG4gKiBQcm9tcHRzIHRoZSB1c2VyIGZvciBtaXNzaW5nIG9wdGlvbnNcbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHByb3ZpZGVkIHZpYSB0aGUgQ0xJXG4gKiBAcmV0dXJucyBUaGUgY29tcGxldGUgb3B0aW9uc1xuICovXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzQ3JlYXRlT3B0aW9ucyhvcHRpb25zOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IHF1ZXN0aW9ucyA9IFtcbiAgICB7XG4gICAgICB0eXBlOiBcImlucHV0XCIsXG4gICAgICBuYW1lOiBcInByZWZpeFwiLFxuICAgICAgbWVzc2FnZTogXCJQcmVmaXggdG8gZGlmZmVyZW50aWF0ZSB0aGlzIGRlcGxveW1lbnRcIixcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMucHJlZml4LFxuICAgICAgYXNrQW5zd2VyZWQ6IGZhbHNlLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJjb25maXJtXCIsXG4gICAgICBuYW1lOiBcImV4aXN0aW5nVnBjXCIsXG4gICAgICBtZXNzYWdlOlxuICAgICAgICBcIkRvIHlvdSB3YW50IHRvIHVzZSBleGlzdGluZyB2cGM/IChzZWxlY3RpbmcgZmFsc2Ugd2lsbCBjcmVhdGUgYSBuZXcgdnBjKVwiLFxuICAgICAgaW5pdGlhbDogb3B0aW9ucy52cGNJZCA/IHRydWUgOiBmYWxzZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IFwiaW5wdXRcIixcbiAgICAgIG5hbWU6IFwidnBjSWRcIixcbiAgICAgIG1lc3NhZ2U6IFwiU3BlY2lmeSBleGlzdGluZyBWcGNJZCAodnBjLXh4eHh4eHh4eHh4eHh4eHh4KVwiLFxuICAgICAgaW5pdGlhbDogb3B0aW9ucy52cGNJZCxcbiAgICAgIHZhbGlkYXRlKHZwY0lkOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzIGFzIGFueSkuc2tpcHBlZCB8fFxuICAgICAgICAgIFJlZ0V4cCgvXnZwYy1bMC05YS1mXXs4LDE3fSQvaSkudGVzdCh2cGNJZClcbiAgICAgICAgICA/IHRydWVcbiAgICAgICAgICA6IFwiRW50ZXIgYSB2YWxpZCBWcGNJZCBpbiB2cGMteHh4eHh4eHh4eHggZm9ybWF0XCI7XG4gICAgICB9LFxuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuZXhpc3RpbmdWcGM7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJjb25maXJtXCIsXG4gICAgICBuYW1lOiBcImNyZWF0ZVZwY0VuZHBvaW50c1wiLFxuICAgICAgbWVzc2FnZTogXCJEbyB5b3Ugd2FudCBjcmVhdGUgVlBDIEVuZHBvaW50cz9cIixcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMuY3JlYXRlVnBjRW5kcG9pbnRzIHx8IGZhbHNlLFxuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuZXhpc3RpbmdWcGM7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJjb25maXJtXCIsXG4gICAgICBuYW1lOiBcInByaXZhdGVXZWJzaXRlXCIsXG4gICAgICBtZXNzYWdlOlxuICAgICAgICBcIkRvIHlvdSB3YW50IHRvIGRlcGxveSBhIHByaXZhdGUgd2Vic2l0ZT8gSS5lIG9ubHkgYWNjZXNzaWJsZSBpbiBWUENcIixcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMucHJpdmF0ZVdlYnNpdGUgfHwgZmFsc2UsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBcImNvbmZpcm1cIixcbiAgICAgIG5hbWU6IFwiY3VzdG9tUHVibGljRG9tYWluXCIsXG4gICAgICBtZXNzYWdlOlxuICAgICAgICBcIkRvIHlvdSB3YW50IHRvIHByb3ZpZGUgYSBjdXN0b20gZG9tYWluIG5hbWUgYW5kIGNvcnJlc3BvbmRpbmcgY2VydGlmaWNhdGUgYXJuIGZvciB0aGUgcHVibGljIHdlYnNpdGUgP1wiLFxuICAgICAgaW5pdGlhbDogb3B0aW9ucy5jdXN0b21QdWJsaWNEb21haW4gfHwgZmFsc2UsXG4gICAgICBza2lwKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLnByaXZhdGVXZWJzaXRlO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IFwiaW5wdXRcIixcbiAgICAgIG5hbWU6IFwiY2VydGlmaWNhdGVcIixcbiAgICAgIHZhbGlkYXRlKHY6IHN0cmluZykge1xuICAgICAgICBpZiAoKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLnByaXZhdGVXZWJzaXRlKSB7XG4gICAgICAgICAgY29uc3QgdmFsaWQgPSBhY21DZXJ0UmVnRXhwLnRlc3Qodik7XG4gICAgICAgICAgcmV0dXJuICh0aGlzIGFzIGFueSkuc2tpcHBlZCB8fCB2YWxpZFxuICAgICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICA6IFwiWW91IG5lZWQgdG8gZW50ZXIgYW4gQUNNIGNlcnRpZmljYXRlIGFyblwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHZhbGlkID0gY2ZBY21DZXJ0UmVnRXhwLnRlc3Qodik7XG4gICAgICAgICAgcmV0dXJuICh0aGlzIGFzIGFueSkuc2tpcHBlZCB8fCB2YWxpZFxuICAgICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgICA6IFwiWW91IG5lZWQgdG8gZW50ZXIgYW4gQUNNIGNlcnRpZmljYXRlIGFybiBpbiB1cy1lYXN0LTEgZm9yIENGXCI7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBtZXNzYWdlKCk6IHN0cmluZyB7XG4gICAgICAgIGlmICgodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuY3VzdG9tUHVibGljRG9tYWluKSB7XG4gICAgICAgICAgcmV0dXJuIFwiQUNNIGNlcnRpZmljYXRlIEFSTiB3aXRoIGN1c3RvbSBkb21haW4gZm9yIHB1YmxpYyB3ZWJzaXRlLiBOb3RlIHRoYXQgdGhlIGNlcnRpZmljYXRlIG11c3QgcmVzaWRlcyBpbiB1cy1lYXN0LTFcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJBQ00gY2VydGlmaWNhdGUgQVJOXCI7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbDogb3B0aW9ucy5jZXJ0aWZpY2F0ZSxcbiAgICAgIHNraXAoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgISh0aGlzIGFzIGFueSkuc3RhdGUuYW5zd2Vycy5wcml2YXRlV2Vic2l0ZSAmJlxuICAgICAgICAgICEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuY3VzdG9tUHVibGljRG9tYWluXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJpbnB1dFwiLFxuICAgICAgbmFtZTogXCJkb21haW5cIixcbiAgICAgIG1lc3NhZ2UoKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCh0aGlzIGFzIGFueSkuc3RhdGUuYW5zd2Vycy5jdXN0b21QdWJsaWNEb21haW4pIHtcbiAgICAgICAgICByZXR1cm4gXCJDdXN0b20gRG9tYWluIGZvciBwdWJsaWMgd2Vic2l0ZSBpLmUgZXhhbXBsZS5jb21cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJEb21haW4gZm9yIHByaXZhdGUgd2Vic2l0ZSBpLmUgZXhhbXBsZS5jb21cIjtcbiAgICAgIH0sXG4gICAgICB2YWxpZGF0ZSh2OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzIGFzIGFueSkuc2tpcHBlZCB8fCB2Lmxlbmd0aCA+IDBcbiAgICAgICAgICA/IHRydWVcbiAgICAgICAgICA6IFwiWW91IG5lZWQgdG8gZW50ZXIgYSBkb21haW4gbmFtZVwiO1xuICAgICAgfSxcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMuZG9tYWluLFxuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAhKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLnByaXZhdGVXZWJzaXRlICYmXG4gICAgICAgICAgISh0aGlzIGFzIGFueSkuc3RhdGUuYW5zd2Vycy5jdXN0b21QdWJsaWNEb21haW5cbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBcImNvbmZpcm1cIixcbiAgICAgIG5hbWU6IFwiY2ZHZW9SZXN0cmljdEVuYWJsZVwiLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgXCJEbyB3YW50IHRvIHJlc3RyaWN0IGFjY2VzcyB0byB0aGUgd2Vic2l0ZSAoQ0YgRGlzdHJpYnV0aW9uKSB0byBvbmx5IGEgY291bnRyeSBvciBjb3VudHJpZXM/XCIsXG4gICAgICBpbml0aWFsOiBvcHRpb25zLmNmR2VvUmVzdHJpY3RFbmFibGUgfHwgZmFsc2UsXG4gICAgICBza2lwKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLnByaXZhdGVXZWJzaXRlO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IFwibXVsdGlzZWxlY3RcIixcbiAgICAgIG5hbWU6IFwiY2ZHZW9SZXN0cmljdExpc3RcIixcbiAgICAgIGhpbnQ6IFwiU1BBQ0UgdG8gc2VsZWN0LCBFTlRFUiB0byBjb25maXJtIHNlbGVjdGlvblwiLFxuICAgICAgbWVzc2FnZTogXCJXaGljaCBjb3VudHJpZXMgZG8geW91IHdpc2ggdG8gQUxMT1cgYWNjZXNzP1wiLFxuICAgICAgY2hvaWNlczogY2ZDb3VudHJpZXMsXG4gICAgICB2YWxpZGF0ZShjaG9pY2VzOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzIGFzIGFueSkuc2tpcHBlZCB8fCBjaG9pY2VzLmxlbmd0aCA+IDBcbiAgICAgICAgICA/IHRydWVcbiAgICAgICAgICA6IFwiWW91IG5lZWQgdG8gc2VsZWN0IGF0IGxlYXN0IG9uZSBjb3VudHJ5XCI7XG4gICAgICB9LFxuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zdGF0ZS5fY2hvaWNlcyA9ICh0aGlzIGFzIGFueSkuc3RhdGUuY2hvaWNlcztcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAhKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLmNmR2VvUmVzdHJpY3RFbmFibGUgfHxcbiAgICAgICAgICAodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMucHJpdmF0ZVdlYnNpdGVcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBpbml0aWFsOiBvcHRpb25zLmNmR2VvUmVzdHJpY3RMaXN0IHx8IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJjb25maXJtXCIsXG4gICAgICBuYW1lOiBcImJlZHJvY2tFbmFibGVcIixcbiAgICAgIG1lc3NhZ2U6IFwiRG8geW91IGhhdmUgYWNjZXNzIHRvIEJlZHJvY2sgYW5kIHdhbnQgdG8gZW5hYmxlIGl0XCIsXG4gICAgICBpbml0aWFsOiB0cnVlLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJzZWxlY3RcIixcbiAgICAgIG5hbWU6IFwiYmVkcm9ja1JlZ2lvblwiLFxuICAgICAgbWVzc2FnZTogXCJSZWdpb24gd2hlcmUgQmVkcm9jayBpcyBhdmFpbGFibGVcIixcbiAgICAgIGNob2ljZXM6IE9iamVjdC52YWx1ZXMoU3VwcG9ydGVkQmVkcm9ja1JlZ2lvbiksXG4gICAgICBpbml0aWFsOiBvcHRpb25zLmJlZHJvY2tSZWdpb24gPz8gXCJ1cy1lYXN0LTFcIixcbiAgICAgIHNraXAoKSB7XG4gICAgICAgIHJldHVybiAhKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLmJlZHJvY2tFbmFibGU7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJpbnB1dFwiLFxuICAgICAgbmFtZTogXCJiZWRyb2NrUm9sZUFyblwiLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgXCJDcm9zcyBhY2NvdW50IHJvbGUgYXJuIHRvIGludm9rZSBCZWRyb2NrIC0gbGVhdmUgZW1wdHkgaWYgQmVkcm9jayBpcyBpbiBzYW1lIGFjY291bnRcIixcbiAgICAgIHZhbGlkYXRlOiAodjogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbGlkID0gaWFtUm9sZVJlZ0V4cC50ZXN0KHYpO1xuICAgICAgICByZXR1cm4gdi5sZW5ndGggPT09IDAgfHwgdmFsaWQ7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbDogb3B0aW9ucy5iZWRyb2NrUm9sZUFybiB8fCBcIlwiLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJjb25maXJtXCIsXG4gICAgICBuYW1lOiBcImVuYWJsZVNhZ2VtYWtlck1vZGVsc1wiLFxuICAgICAgbWVzc2FnZTogXCJEbyB5b3Ugd2FudCB0byB1c2UgYW55IFNhZ2VtYWtlciBNb2RlbHNcIixcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMuZW5hYmxlU2FnZW1ha2VyTW9kZWxzIHx8IGZhbHNlLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJtdWx0aXNlbGVjdFwiLFxuICAgICAgbmFtZTogXCJzYWdlbWFrZXJNb2RlbHNcIixcbiAgICAgIGhpbnQ6IFwiU1BBQ0UgdG8gc2VsZWN0LCBFTlRFUiB0byBjb25maXJtIHNlbGVjdGlvbiBbZGVub3RlcyBpbnN0YW5jZSBzaXplIHRvIGhvc3QgbW9kZWxdXCIsXG4gICAgICBtZXNzYWdlOiBcIldoaWNoIFNhZ2VNYWtlciBNb2RlbHMgZG8geW91IHdhbnQgdG8gZW5hYmxlXCIsXG4gICAgICBjaG9pY2VzOiBPYmplY3QudmFsdWVzKFN1cHBvcnRlZFNhZ2VNYWtlck1vZGVscyksXG4gICAgICBpbml0aWFsOlxuICAgICAgICAob3B0aW9ucy5zYWdlbWFrZXJNb2RlbHMgPz8gW10pLmZpbHRlcigobTogc3RyaW5nKSA9PlxuICAgICAgICAgIE9iamVjdC52YWx1ZXMoU3VwcG9ydGVkU2FnZU1ha2VyTW9kZWxzKVxuICAgICAgICAgICAgLm1hcCgoeCkgPT4geC50b1N0cmluZygpKVxuICAgICAgICAgICAgLmluY2x1ZGVzKG0pXG4gICAgICAgICkgfHwgW10sXG4gICAgICB2YWxpZGF0ZShjaG9pY2VzOiBhbnkpIHtcbiAgICAgICAgLy9UcmFwIGZvciBuZXcgcGxheWVycywgdmFsaWRhdGUgYWx3YXlzIHJ1bnMgZXZlbiBpZiBza2lwcGVkIGlzIHRydWVcbiAgICAgICAgLy8gU28gbmVlZCB0byBoYW5kbGUgdmFsaWRhdGUgYmFpbCBvdXQgaWYgc2tpcHBlZCBpcyB0cnVlXG4gICAgICAgIHJldHVybiAodGhpcyBhcyBhbnkpLnNraXBwZWQgfHwgY2hvaWNlcy5sZW5ndGggPiAwXG4gICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgOiBcIllvdSBuZWVkIHRvIHNlbGVjdCBhdCBsZWFzdCBvbmUgbW9kZWxcIjtcbiAgICAgIH0sXG4gICAgICBza2lwKCk6IGJvb2xlYW4ge1xuICAgICAgICAodGhpcyBhcyBhbnkpLnN0YXRlLl9jaG9pY2VzID0gKHRoaXMgYXMgYW55KS5zdGF0ZS5jaG9pY2VzO1xuICAgICAgICByZXR1cm4gISh0aGlzIGFzIGFueSkuc3RhdGUuYW5zd2Vycy5lbmFibGVTYWdlbWFrZXJNb2RlbHM7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJpbnB1dFwiLFxuICAgICAgbmFtZTogXCJodWdnaW5nZmFjZUFwaVNlY3JldEFyblwiLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgXCJTb21lIEh1Z2dpbmdGYWNlIG1vZGVscyBpbmNsdWRpbmcgbWlzdHJhbCBub3cgcmVxdWlyZSBhbiBBUEkga2V5LCBQbGVhc2UgZW50ZXIgYW4gU2VjcmV0cyBNYW5hZ2VyIFNlY3JldCBBUk4gKHNlZSBkb2NzOiBNb2RlbCBSZXF1aXJlbWVudHMpXCIsXG4gICAgICB2YWxpZGF0ZTogKHY6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCB2YWxpZCA9IHNlY3JldE1hbmFnZXJBcm5SZWdFeHAudGVzdCh2KTtcbiAgICAgICAgcmV0dXJuIHYubGVuZ3RoID09PSAwIHx8IHZhbGlkXG4gICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgOiBcIklmIHlvdSBhcmUgc3VwcGx5aW5nIGEgSEYgQVBJIGtleSBpdCBuZWVkcyB0byBiZSBhIHJlZmVyZW5jZSB0byBhIHNlY3JldHMgbWFuYWdlciBzZWNyZXQgQVJOXCI7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbDogb3B0aW9ucy5odWdnaW5nZmFjZUFwaVNlY3JldEFybiB8fCBcIlwiLFxuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuZW5hYmxlU2FnZW1ha2VyTW9kZWxzO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IFwiY29uZmlybVwiLFxuICAgICAgbmFtZTogXCJlbmFibGVTYWdlbWFrZXJNb2RlbHNTY2hlZHVsZVwiLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgXCJEbyB5b3Ugd2FudCB0byBlbmFibGUgYSBzdGFydC9zdG9wIHNjaGVkdWxlIGZvciBzYWdlbWFrZXIgbW9kZWxzP1wiLFxuICAgICAgaW5pdGlhbCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAob3B0aW9ucy5lbmFibGVTYWdlbWFrZXJNb2RlbHNTY2hlZHVsZSAmJlxuICAgICAgICAgICAgKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLmVuYWJsZVNhZ2VtYWtlck1vZGVscykgfHxcbiAgICAgICAgICBmYWxzZVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIHNraXAoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLmVuYWJsZVNhZ2VtYWtlck1vZGVscztcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBcIkF1dG9Db21wbGV0ZVwiLFxuICAgICAgbmFtZTogXCJ0aW1lem9uZVBpY2tlclwiLFxuICAgICAgaGludDogXCJzdGFydCB0eXBpbmcgdG8gYXV0byBjb21wbGV0ZSwgRU5URVIgdG8gY29uZmlybSBzZWxlY3Rpb25cIixcbiAgICAgIG1lc3NhZ2U6IFwiV2hpY2ggVGltZVpvbmUgZG8geW91IHdhbnQgdG8gcnVuIHRoZSBzY2hlZHVsZSBpbj9cIixcbiAgICAgIGNob2ljZXM6IHRpbWVab25lRGF0YSxcbiAgICAgIHZhbGlkYXRlKGNob2ljZXM6IGFueSkge1xuICAgICAgICByZXR1cm4gKHRoaXMgYXMgYW55KS5za2lwcGVkIHx8IGNob2ljZXMubGVuZ3RoID4gMFxuICAgICAgICAgID8gdHJ1ZVxuICAgICAgICAgIDogXCJZb3UgbmVlZCB0byBzZWxlY3QgYXQgbGVhc3Qgb25lIHRpbWUgem9uZVwiO1xuICAgICAgfSxcbiAgICAgIHNraXAoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLmVuYWJsZVNhZ2VtYWtlck1vZGVsc1NjaGVkdWxlO1xuICAgICAgfSxcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMudGltZXpvbmVQaWNrZXIgfHwgW10sXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBcInNlbGVjdFwiLFxuICAgICAgbmFtZTogXCJlbmFibGVDcm9uRm9ybWF0XCIsXG4gICAgICBjaG9pY2VzOiBbXG4gICAgICAgIHsgbWVzc2FnZTogXCJTaW1wbGUgLSBXaXphcmQgbGVhZFwiLCBuYW1lOiBcInNpbXBsZVwiIH0sXG4gICAgICAgIHsgbWVzc2FnZTogXCJBZHZhbmNlZCAtIFByb3ZpZGUgY3JvbiBleHByZXNzaW9uXCIsIG5hbWU6IFwiY3JvblwiIH0sXG4gICAgICBdLFxuICAgICAgbWVzc2FnZTogXCJIb3cgZG8geW91IHdhbnQgdG8gc2V0IHRoZSBzY2hlZHVsZT9cIixcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMuZW5hYmxlQ3JvbkZvcm1hdCB8fCBcIlwiLFxuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zdGF0ZS5fY2hvaWNlcyA9ICh0aGlzIGFzIGFueSkuc3RhdGUuY2hvaWNlcztcbiAgICAgICAgcmV0dXJuICEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuZW5hYmxlU2FnZW1ha2VyTW9kZWxzU2NoZWR1bGU7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJpbnB1dFwiLFxuICAgICAgbmFtZTogXCJzYWdlbWFrZXJDcm9uU3RhcnRTY2hlZHVsZVwiLFxuICAgICAgaGludDogXCJUaGlzIGNyb24gZm9ybWF0IGlzIHVzaW5nIEFXUyBldmVudGJyaWRnZSBjcm9uIHN5bnRheCBzZWUgZG9jcyBmb3IgbW9yZSBpbmZvcm1hdGlvblwiLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgXCJTdGFydCBzY2hlZHVsZSBmb3IgU2FnbWFrZXIgbW9kZWxzIGV4cHJlc3NlZCBpbiBVVEMgQVdTIGNyb24gZm9ybWF0XCIsXG4gICAgICBza2lwKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISh0aGlzIGFzIGFueSkuc3RhdGUuYW5zd2Vycy5lbmFibGVDcm9uRm9ybWF0LmluY2x1ZGVzKFwiY3JvblwiKTtcbiAgICAgIH0sXG4gICAgICB2YWxpZGF0ZSh2OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCh0aGlzIGFzIGFueSkuc2tpcHBlZCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgQVdTQ3JvblZhbGlkYXRvci52YWxpZGF0ZSh2KTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMuY3JvblNhZ2VtYWtlck1vZGVsc1NjaGVkdWxlU3RhcnQsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBcImlucHV0XCIsXG4gICAgICBuYW1lOiBcInNhZ2VtYWtlckNyb25TdG9wU2NoZWR1bGVcIixcbiAgICAgIGhpbnQ6IFwiVGhpcyBjcm9uIGZvcm1hdCBpcyB1c2luZyBBV1MgZXZlbnRicmlkZ2UgY3JvbiBzeW50YXggc2VlIGRvY3MgZm9yIG1vcmUgaW5mb3JtYXRpb25cIixcbiAgICAgIG1lc3NhZ2U6IFwiU3RvcCBzY2hlZHVsZSBmb3IgU2FnbWFrZXIgbW9kZWxzIGV4cHJlc3NlZCBpbiBBV1MgY3JvbiBmb3JtYXRcIixcbiAgICAgIHNraXAoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLmVuYWJsZUNyb25Gb3JtYXQuaW5jbHVkZXMoXCJjcm9uXCIpO1xuICAgICAgfSxcbiAgICAgIHZhbGlkYXRlKHY6IHN0cmluZykge1xuICAgICAgICBpZiAoKHRoaXMgYXMgYW55KS5za2lwcGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBBV1NDcm9uVmFsaWRhdG9yLnZhbGlkYXRlKHYpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZXJyb3IubWVzc2FnZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaW5pdGlhbDogb3B0aW9ucy5jcm9uU2FnZW1ha2VyTW9kZWxzU2NoZWR1bGVTdG9wLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJtdWx0aXNlbGVjdFwiLFxuICAgICAgbmFtZTogXCJkYXlzRm9yU2NoZWR1bGVcIixcbiAgICAgIGhpbnQ6IFwiU1BBQ0UgdG8gc2VsZWN0LCBFTlRFUiB0byBjb25maXJtIHNlbGVjdGlvblwiLFxuICAgICAgbWVzc2FnZTogXCJXaGljaCBkYXlzIG9mIHRoZSB3ZWVrIHdvdWxkIHlvdSBsaWtlIHRvIHJ1biB0aGUgc2NoZWR1bGUgb24/XCIsXG4gICAgICBjaG9pY2VzOiBbXG4gICAgICAgIHsgbWVzc2FnZTogXCJTdW5kYXlcIiwgbmFtZTogXCJTVU5cIiB9LFxuICAgICAgICB7IG1lc3NhZ2U6IFwiTW9uZGF5XCIsIG5hbWU6IFwiTU9OXCIgfSxcbiAgICAgICAgeyBtZXNzYWdlOiBcIlR1ZXNkYXlcIiwgbmFtZTogXCJUVUVcIiB9LFxuICAgICAgICB7IG1lc3NhZ2U6IFwiV2VkbmVzZGF5XCIsIG5hbWU6IFwiV0VEXCIgfSxcbiAgICAgICAgeyBtZXNzYWdlOiBcIlRodXJzZGF5XCIsIG5hbWU6IFwiVEhVXCIgfSxcbiAgICAgICAgeyBtZXNzYWdlOiBcIkZyaWRheVwiLCBuYW1lOiBcIkZSSVwiIH0sXG4gICAgICAgIHsgbWVzc2FnZTogXCJTYXR1cmRheVwiLCBuYW1lOiBcIlNBVFwiIH0sXG4gICAgICBdLFxuICAgICAgdmFsaWRhdGUoY2hvaWNlczogYW55KSB7XG4gICAgICAgIHJldHVybiAodGhpcyBhcyBhbnkpLnNraXBwZWQgfHwgY2hvaWNlcy5sZW5ndGggPiAwXG4gICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgOiBcIllvdSBuZWVkIHRvIHNlbGVjdCBhdCBsZWFzdCBvbmUgZGF5XCI7XG4gICAgICB9LFxuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zdGF0ZS5fY2hvaWNlcyA9ICh0aGlzIGFzIGFueSkuc3RhdGUuY2hvaWNlcztcbiAgICAgICAgaWYgKCEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuZW5hYmxlU2FnZW1ha2VyTW9kZWxzU2NoZWR1bGUpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gISh0aGlzIGFzIGFueSkuc3RhdGUuYW5zd2Vycy5lbmFibGVDcm9uRm9ybWF0LmluY2x1ZGVzKFwic2ltcGxlXCIpO1xuICAgICAgfSxcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMuZGF5c0ZvclNjaGVkdWxlIHx8IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJpbnB1dFwiLFxuICAgICAgbmFtZTogXCJzY2hlZHVsZVN0YXJ0VGltZVwiLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgXCJXaGF0IHRpbWUgb2YgZGF5IGRvIHlvdSB3aXNoIHRvIHJ1biB0aGUgc3RhcnQgc2NoZWR1bGU/IGVudGVyIGluIEhIOk1NIGZvcm1hdFwiLFxuICAgICAgdmFsaWRhdGUodjogc3RyaW5nKSB7XG4gICAgICAgIGlmICgodGhpcyBhcyBhbnkpLnNraXBwZWQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2ggSEg6TU0gZm9ybWF0XG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gL14oWzAtMV0/WzAtOV18MlswLTNdKTooWzAtNV0/WzAtOV0pJC87XG4gICAgICAgIHJldHVybiByZWdleC50ZXN0KHYpIHx8IFwiVGltZSBtdXN0IGJlIGluIEhIOk1NIGZvcm1hdCFcIjtcbiAgICAgIH0sXG4gICAgICBza2lwKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoISh0aGlzIGFzIGFueSkuc3RhdGUuYW5zd2Vycy5lbmFibGVTYWdlbWFrZXJNb2RlbHNTY2hlZHVsZSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLmVuYWJsZUNyb25Gb3JtYXQuaW5jbHVkZXMoXCJzaW1wbGVcIik7XG4gICAgICB9LFxuICAgICAgaW5pdGlhbDogb3B0aW9ucy5zY2hlZHVsZVN0YXJ0VGltZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IFwiaW5wdXRcIixcbiAgICAgIG5hbWU6IFwic2NoZWR1bGVTdG9wVGltZVwiLFxuICAgICAgbWVzc2FnZTpcbiAgICAgICAgXCJXaGF0IHRpbWUgb2YgZGF5IGRvIHlvdSB3aXNoIHRvIHJ1biB0aGUgc3RvcCBzY2hlZHVsZT8gZW50ZXIgaW4gSEg6TU0gZm9ybWF0XCIsXG4gICAgICB2YWxpZGF0ZSh2OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCh0aGlzIGFzIGFueSkuc2tpcHBlZCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYXRjaCBISDpNTSBmb3JtYXRcbiAgICAgICAgY29uc3QgcmVnZXggPSAvXihbMC0xXT9bMC05XXwyWzAtM10pOihbMC01XT9bMC05XSkkLztcbiAgICAgICAgcmV0dXJuIHJlZ2V4LnRlc3QodikgfHwgXCJUaW1lIG11c3QgYmUgaW4gSEg6TU0gZm9ybWF0IVwiO1xuICAgICAgfSxcbiAgICAgIHNraXAoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghKHRoaXMgYXMgYW55KS5zdGF0ZS5hbnN3ZXJzLmVuYWJsZVNhZ2VtYWtlck1vZGVsc1NjaGVkdWxlKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuZW5hYmxlQ3JvbkZvcm1hdC5pbmNsdWRlcyhcInNpbXBsZVwiKTtcbiAgICAgIH0sXG4gICAgICBpbml0aWFsOiBvcHRpb25zLnNjaGVkdWxlU3RvcFRpbWUsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBcImNvbmZpcm1cIixcbiAgICAgIG5hbWU6IFwiZW5hYmxlU2NoZWR1bGVFbmREYXRlXCIsXG4gICAgICBtZXNzYWdlOlxuICAgICAgICBcIldvdWxkIHlvdSBsaWtlIHRvIHNldCBhbiBlbmQgZGF0YSBmb3IgdGhlIHN0YXJ0IHNjaGVkdWxlPyAoYWZ0ZXIgdGhpcyBkYXRlIHRoZSBtb2RlbHMgd291bGQgbm8gbG9uZ2VyIHN0YXJ0KVwiLFxuICAgICAgaW5pdGlhbDogb3B0aW9ucy5lbmFibGVTY2hlZHVsZUVuZERhdGUgfHwgZmFsc2UsXG4gICAgICBza2lwKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISh0aGlzIGFzIGFueSkuc3RhdGUuYW5zd2Vycy5lbmFibGVTYWdlbWFrZXJNb2RlbHNTY2hlZHVsZTtcbiAgICAgIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBcImlucHV0XCIsXG4gICAgICBuYW1lOiBcInN0YXJ0U2NoZWR1bGVFbmREYXRlXCIsXG4gICAgICBtZXNzYWdlOiBcIkFmdGVyIHRoaXMgZGF0ZSB0aGUgbW9kZWxzIHdpbGwgbm8gbG9uZ2VyIHN0YXJ0XCIsXG4gICAgICBoaW50OiBcIllZWVktTU0tRERcIixcbiAgICAgIHZhbGlkYXRlKHY6IHN0cmluZykge1xuICAgICAgICBpZiAoKHRoaXMgYXMgYW55KS5za2lwcGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBpc1ZhbGlkRGF0ZSh2KSB8fFxuICAgICAgICAgIFwiVGhlIGRhdGUgbXVzdCBiZSBpbiBmb3JtYXQgWVlZWS9NTS9ERCBhbmQgYmUgaW4gdGhlIGZ1dHVyZVwiXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuZW5hYmxlU2NoZWR1bGVFbmREYXRlO1xuICAgICAgfSxcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMuc3RhcnRTY2hlZHVsZUVuZERhdGUgfHwgZmFsc2UsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBcImNvbmZpcm1cIixcbiAgICAgIG5hbWU6IFwiZW5hYmxlUmFnXCIsXG4gICAgICBtZXNzYWdlOiBcIkRvIHlvdSB3YW50IHRvIGVuYWJsZSBSQUdcIixcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMuZW5hYmxlUmFnIHx8IGZhbHNlLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJtdWx0aXNlbGVjdFwiLFxuICAgICAgbmFtZTogXCJyYWdzVG9FbmFibGVcIixcbiAgICAgIGhpbnQ6IFwiU1BBQ0UgdG8gc2VsZWN0LCBFTlRFUiB0byBjb25maXJtIHNlbGVjdGlvblwiLFxuICAgICAgbWVzc2FnZTogXCJXaGljaCBkYXRhc3RvcmVzIGRvIHlvdSB3YW50IHRvIGVuYWJsZSBmb3IgUkFHXCIsXG4gICAgICBjaG9pY2VzOiBbXG4gICAgICAgIHsgbWVzc2FnZTogXCJBdXJvcmFcIiwgbmFtZTogXCJhdXJvcmFcIiB9LFxuICAgICAgICB7IG1lc3NhZ2U6IFwiT3BlblNlYXJjaFwiLCBuYW1lOiBcIm9wZW5zZWFyY2hcIiB9LFxuICAgICAgICB7IG1lc3NhZ2U6IFwiS2VuZHJhIChtYW5hZ2VkKVwiLCBuYW1lOiBcImtlbmRyYVwiIH0sXG4gICAgICBdLFxuICAgICAgdmFsaWRhdGUoY2hvaWNlczogYW55KSB7XG4gICAgICAgIHJldHVybiAodGhpcyBhcyBhbnkpLnNraXBwZWQgfHwgY2hvaWNlcy5sZW5ndGggPiAwXG4gICAgICAgICAgPyB0cnVlXG4gICAgICAgICAgOiBcIllvdSBuZWVkIHRvIHNlbGVjdCBhdCBsZWFzdCBvbmUgZW5naW5lXCI7XG4gICAgICB9LFxuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgLy8gd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL2VucXVpcmVyL2VucXVpcmVyL2lzc3Vlcy8yOThcbiAgICAgICAgKHRoaXMgYXMgYW55KS5zdGF0ZS5fY2hvaWNlcyA9ICh0aGlzIGFzIGFueSkuc3RhdGUuY2hvaWNlcztcbiAgICAgICAgcmV0dXJuICEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuZW5hYmxlUmFnO1xuICAgICAgfSxcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMucmFnc1RvRW5hYmxlIHx8IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJjb25maXJtXCIsXG4gICAgICBuYW1lOiBcImtlbmRyYUVudGVycHJpc2VcIixcbiAgICAgIG1lc3NhZ2U6IFwiRG8geW91IHdhbnQgdG8gZW5hYmxlIEtlbmRyYSBFbnRlcnByaXNlIEVkaXRpb24/XCIsXG4gICAgICBpbml0aWFsOiBvcHRpb25zLmtlbmRyYUVudGVycHJpc2UgfHwgZmFsc2UsXG4gICAgICBza2lwKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISh0aGlzIGFzIGFueSkuc3RhdGUuYW5zd2Vycy5yYWdzVG9FbmFibGUuaW5jbHVkZXMoXCJrZW5kcmFcIik7XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogXCJjb25maXJtXCIsXG4gICAgICBuYW1lOiBcImtlbmRyYVwiLFxuICAgICAgbWVzc2FnZTogXCJEbyB5b3Ugd2FudCB0byBhZGQgZXhpc3RpbmcgS2VuZHJhIGluZGV4ZXNcIixcbiAgICAgIGluaXRpYWw6XG4gICAgICAgIChvcHRpb25zLmtlbmRyYUV4dGVybmFsICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICBvcHRpb25zLmtlbmRyYUV4dGVybmFsLmxlbmd0aCA+IDApIHx8XG4gICAgICAgIGZhbHNlLFxuICAgICAgc2tpcCgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMuZW5hYmxlUmFnKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICEodGhpcyBhcyBhbnkpLnN0YXRlLmFuc3dlcnMucmFnc1RvRW5hYmxlLmluY2x1ZGVzKFwia2VuZHJhXCIpO1xuICAgICAgfSxcbiAgICB9LFxuICBdO1xuICBjb25zdCBhbnN3ZXJzOiBhbnkgPSBhd2FpdCBlbnF1aXJlci5wcm9tcHQocXVlc3Rpb25zKTtcbiAgY29uc3Qga2VuZHJhRXh0ZXJuYWw6IGFueVtdID0gW107XG4gIGxldCBuZXdLZW5kcmEgPSBhbnN3ZXJzLmVuYWJsZVJhZyAmJiBhbnN3ZXJzLmtlbmRyYTtcbiAgY29uc3QgZXhpc3RpbmdLZW5kcmFJbmRpY2VzID0gQXJyYXkuZnJvbShvcHRpb25zLmtlbmRyYUV4dGVybmFsIHx8IFtdKTtcbiAgd2hpbGUgKG5ld0tlbmRyYSA9PT0gdHJ1ZSkge1xuICAgIGxldCBleGlzdGluZ0luZGV4OiBhbnkgPSBleGlzdGluZ0tlbmRyYUluZGljZXMucG9wKCk7XG4gICAgY29uc3Qga2VuZHJhUSA9IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogXCJpbnB1dFwiLFxuICAgICAgICBuYW1lOiBcIm5hbWVcIixcbiAgICAgICAgbWVzc2FnZTogXCJLZW5kcmEgc291cmNlIG5hbWVcIixcbiAgICAgICAgdmFsaWRhdGUodjogc3RyaW5nKSB7XG4gICAgICAgICAgcmV0dXJuIFJlZ0V4cCgvXlxcd1tcXHctX10qXFx3JC8pLnRlc3Qodik7XG4gICAgICAgIH0sXG4gICAgICAgIGluaXRpYWw6IGV4aXN0aW5nSW5kZXg/Lm5hbWUsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlOiBcImF1dG9jb21wbGV0ZVwiLFxuICAgICAgICBsaW1pdDogOCxcbiAgICAgICAgbmFtZTogXCJyZWdpb25cIixcbiAgICAgICAgY2hvaWNlczogT2JqZWN0LnZhbHVlcyhTdXBwb3J0ZWRSZWdpb24pLFxuICAgICAgICBtZXNzYWdlOiBgUmVnaW9uIG9mIHRoZSBLZW5kcmEgaW5kZXgke1xuICAgICAgICAgIGV4aXN0aW5nSW5kZXg/LnJlZ2lvbiA/IFwiIChcIiArIGV4aXN0aW5nSW5kZXg/LnJlZ2lvbiArIFwiKVwiIDogXCJcIlxuICAgICAgICB9YCxcbiAgICAgICAgaW5pdGlhbDogT2JqZWN0LnZhbHVlcyhTdXBwb3J0ZWRSZWdpb24pLmluZGV4T2YoZXhpc3RpbmdJbmRleD8ucmVnaW9uKSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHR5cGU6IFwiaW5wdXRcIixcbiAgICAgICAgbmFtZTogXCJyb2xlQXJuXCIsXG4gICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgXCJDcm9zcyBhY2NvdW50IHJvbGUgQXJuIHRvIGFzc3VtZSB0byBjYWxsIEtlbmRyYSwgbGVhdmUgZW1wdHkgaWYgbm90IG5lZWRlZFwiLFxuICAgICAgICB2YWxpZGF0ZTogKHY6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGNvbnN0IHZhbGlkID0gaWFtUm9sZVJlZ0V4cC50ZXN0KHYpO1xuICAgICAgICAgIHJldHVybiB2Lmxlbmd0aCA9PT0gMCB8fCB2YWxpZDtcbiAgICAgICAgfSxcbiAgICAgICAgaW5pdGlhbDogZXhpc3RpbmdJbmRleD8ucm9sZUFybiA/PyBcIlwiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogXCJpbnB1dFwiLFxuICAgICAgICBuYW1lOiBcImtlbmRyYUlkXCIsXG4gICAgICAgIG1lc3NhZ2U6IFwiS2VuZHJhIElEXCIsXG4gICAgICAgIHZhbGlkYXRlKHY6IHN0cmluZykge1xuICAgICAgICAgIHJldHVybiBrZW5kcmFJZFJlZ0V4cC50ZXN0KHYpO1xuICAgICAgICB9LFxuICAgICAgICBpbml0aWFsOiBleGlzdGluZ0luZGV4Py5rZW5kcmFJZCxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHR5cGU6IFwiY29uZmlybVwiLFxuICAgICAgICBuYW1lOiBcImVuYWJsZWRcIixcbiAgICAgICAgbWVzc2FnZTogXCJFbmFibGUgdGhpcyBpbmRleFwiLFxuICAgICAgICBpbml0aWFsOiBleGlzdGluZ0luZGV4Py5lbmFibGVkID8/IHRydWUsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0eXBlOiBcImNvbmZpcm1cIixcbiAgICAgICAgbmFtZTogXCJuZXdLZW5kcmFcIixcbiAgICAgICAgbWVzc2FnZTogXCJEbyB5b3Ugd2FudCB0byBhZGQgYW5vdGhlciBLZW5kcmEgc291cmNlXCIsXG4gICAgICAgIGluaXRpYWw6IGZhbHNlLFxuICAgICAgfSxcbiAgICBdO1xuICAgIGNvbnN0IGtlbmRyYUluc3RhbmNlOiBhbnkgPSBhd2FpdCBlbnF1aXJlci5wcm9tcHQoa2VuZHJhUSk7XG4gICAgY29uc3QgZXh0ID0gKCh7IGVuYWJsZWQsIG5hbWUsIHJvbGVBcm4sIGtlbmRyYUlkLCByZWdpb24gfSkgPT4gKHtcbiAgICAgIGVuYWJsZWQsXG4gICAgICBuYW1lLFxuICAgICAgcm9sZUFybixcbiAgICAgIGtlbmRyYUlkLFxuICAgICAgcmVnaW9uLFxuICAgIH0pKShrZW5kcmFJbnN0YW5jZSk7XG4gICAgaWYgKGV4dC5yb2xlQXJuID09PSBcIlwiKSBleHQucm9sZUFybiA9IHVuZGVmaW5lZDtcbiAgICBrZW5kcmFFeHRlcm5hbC5wdXNoKHtcbiAgICAgIC4uLmV4dCxcbiAgICB9KTtcbiAgICBuZXdLZW5kcmEgPSBrZW5kcmFJbnN0YW5jZS5uZXdLZW5kcmE7XG4gIH1cbiAgY29uc3QgbW9kZWxzUHJvbXB0cyA9IFtcbiAgICB7XG4gICAgICB0eXBlOiBcInNlbGVjdFwiLFxuICAgICAgbmFtZTogXCJkZWZhdWx0RW1iZWRkaW5nXCIsXG4gICAgICBtZXNzYWdlOiBcIlNlbGVjdCBhIGRlZmF1bHQgZW1iZWRkaW5nIG1vZGVsXCIsXG4gICAgICBjaG9pY2VzOiBlbWJlZGRpbmdNb2RlbHMubWFwKChtKSA9PiAoeyBuYW1lOiBtLm5hbWUsIHZhbHVlOiBtIH0pKSxcbiAgICAgIGluaXRpYWw6IG9wdGlvbnMuZGVmYXVsdEVtYmVkZGluZyxcbiAgICAgIHZhbGlkYXRlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCh0aGlzIGFzIGFueSkuc3RhdGUuYW5zd2Vycy5lbmFibGVSYWcpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUgPyB0cnVlIDogXCJTZWxlY3QgYSBkZWZhdWx0IGVtYmVkZGluZyBtb2RlbFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgc2tpcCgpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAhYW5zd2Vycy5lbmFibGVSYWcgfHxcbiAgICAgICAgICAhKFxuICAgICAgICAgICAgYW5zd2Vycy5yYWdzVG9FbmFibGUuaW5jbHVkZXMoXCJhdXJvcmFcIikgfHxcbiAgICAgICAgICAgIGFuc3dlcnMucmFnc1RvRW5hYmxlLmluY2x1ZGVzKFwib3BlbnNlYXJjaFwiKVxuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgfSxcbiAgXTtcbiAgY29uc3QgbW9kZWxzOiBhbnkgPSBhd2FpdCBlbnF1aXJlci5wcm9tcHQobW9kZWxzUHJvbXB0cyk7XG5cbiAgLy8gQ29udmVydCBzaW1wbGUgdGltZSBpbnRvIGNyb24gZm9ybWF0IGZvciBzY2hlZHVsZVxuICBpZiAoXG4gICAgYW5zd2Vycy5lbmFibGVTYWdlbWFrZXJNb2RlbHNTY2hlZHVsZSAmJlxuICAgIGFuc3dlcnMuZW5hYmxlQ3JvbkZvcm1hdCA9PSBcInNpbXBsZVwiXG4gICkge1xuICAgIGNvbnN0IGRheXNUb1J1blNjaGVkdWxlID0gYW5zd2Vycy5kYXlzRm9yU2NoZWR1bGUuam9pbihcIixcIik7XG4gICAgY29uc3Qgc3RhcnRNaW51dGVzID0gYW5zd2Vycy5zY2hlZHVsZVN0YXJ0VGltZS5zcGxpdChcIjpcIilbMV07XG4gICAgY29uc3Qgc3RhcnRIb3VyID0gYW5zd2Vycy5zY2hlZHVsZVN0YXJ0VGltZS5zcGxpdChcIjpcIilbMF07XG4gICAgYW5zd2Vycy5zYWdlbWFrZXJDcm9uU3RhcnRTY2hlZHVsZSA9IGAke3N0YXJ0TWludXRlc30gJHtzdGFydEhvdXJ9ID8gKiAke2RheXNUb1J1blNjaGVkdWxlfSAqYDtcbiAgICBBV1NDcm9uVmFsaWRhdG9yLnZhbGlkYXRlKGFuc3dlcnMuc2FnZW1ha2VyQ3JvblN0YXJ0U2NoZWR1bGUpO1xuXG4gICAgY29uc3Qgc3RvcE1pbnV0ZXMgPSBhbnN3ZXJzLnNjaGVkdWxlU3RvcFRpbWUuc3BsaXQoXCI6XCIpWzFdO1xuICAgIGNvbnN0IHN0b3BIb3VyID0gYW5zd2Vycy5zY2hlZHVsZVN0b3BUaW1lLnNwbGl0KFwiOlwiKVswXTtcbiAgICBhbnN3ZXJzLnNhZ2VtYWtlckNyb25TdG9wU2NoZWR1bGUgPSBgJHtzdG9wTWludXRlc30gJHtzdG9wSG91cn0gPyAqICR7ZGF5c1RvUnVuU2NoZWR1bGV9ICpgO1xuICAgIEFXU0Nyb25WYWxpZGF0b3IudmFsaWRhdGUoYW5zd2Vycy5zYWdlbWFrZXJDcm9uU3RvcFNjaGVkdWxlKTtcbiAgfVxuXG4gIC8vIENyZWF0ZSB0aGUgY29uZmlnIG9iamVjdFxuICBjb25zdCBjb25maWcgPSB7XG4gICAgcHJlZml4OiBhbnN3ZXJzLnByZWZpeCxcbiAgICB2cGM6IGFuc3dlcnMuZXhpc3RpbmdWcGNcbiAgICAgID8ge1xuICAgICAgICAgIHZwY0lkOiBhbnN3ZXJzLnZwY0lkLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgY3JlYXRlVnBjRW5kcG9pbnRzOiBhbnN3ZXJzLmNyZWF0ZVZwY0VuZHBvaW50cyxcbiAgICAgICAgfVxuICAgICAgOiB1bmRlZmluZWQsXG4gICAgcHJpdmF0ZVdlYnNpdGU6IGFuc3dlcnMucHJpdmF0ZVdlYnNpdGUsXG4gICAgY2VydGlmaWNhdGU6IGFuc3dlcnMuY2VydGlmaWNhdGUsXG4gICAgZG9tYWluOiBhbnN3ZXJzLmRvbWFpbixcbiAgICBjZkdlb1Jlc3RyaWN0RW5hYmxlOiBhbnN3ZXJzLmNmR2VvUmVzdHJpY3RFbmFibGUsXG4gICAgY2ZHZW9SZXN0cmljdExpc3Q6IGFuc3dlcnMuY2ZHZW9SZXN0cmljdExpc3QsXG4gICAgYmVkcm9jazogYW5zd2Vycy5iZWRyb2NrRW5hYmxlXG4gICAgICA/IHtcbiAgICAgICAgICBlbmFibGVkOiBhbnN3ZXJzLmJlZHJvY2tFbmFibGUsXG4gICAgICAgICAgcmVnaW9uOiBhbnN3ZXJzLmJlZHJvY2tSZWdpb24sXG4gICAgICAgICAgcm9sZUFybjpcbiAgICAgICAgICAgIGFuc3dlcnMuYmVkcm9ja1JvbGVBcm4gPT09IFwiXCIgPyB1bmRlZmluZWQgOiBhbnN3ZXJzLmJlZHJvY2tSb2xlQXJuLFxuICAgICAgICB9XG4gICAgICA6IHVuZGVmaW5lZCxcbiAgICBsbG1zOiB7XG4gICAgICBzYWdlbWFrZXI6IGFuc3dlcnMuc2FnZW1ha2VyTW9kZWxzLFxuICAgICAgaHVnZ2luZ2ZhY2VBcGlTZWNyZXRBcm46IGFuc3dlcnMuaHVnZ2luZ2ZhY2VBcGlTZWNyZXRBcm4sXG4gICAgICBzYWdlbWFrZXJTY2hlZHVsZTogYW5zd2Vycy5lbmFibGVTYWdlbWFrZXJNb2RlbHNTY2hlZHVsZVxuICAgICAgICA/IHtcbiAgICAgICAgICAgIGVuYWJsZWQ6IGFuc3dlcnMuZW5hYmxlU2FnZW1ha2VyTW9kZWxzU2NoZWR1bGUsXG4gICAgICAgICAgICB0aW1lem9uZVBpY2tlcjogYW5zd2Vycy50aW1lem9uZVBpY2tlcixcbiAgICAgICAgICAgIGVuYWJsZUNyb25Gb3JtYXQ6IGFuc3dlcnMuZW5hYmxlQ3JvbkZvcm1hdCxcbiAgICAgICAgICAgIHNhZ2VtYWtlckNyb25TdGFydFNjaGVkdWxlOiBhbnN3ZXJzLnNhZ2VtYWtlckNyb25TdGFydFNjaGVkdWxlLFxuICAgICAgICAgICAgc2FnZW1ha2VyQ3JvblN0b3BTY2hlZHVsZTogYW5zd2Vycy5zYWdlbWFrZXJDcm9uU3RvcFNjaGVkdWxlLFxuICAgICAgICAgICAgZGF5c0ZvclNjaGVkdWxlOiBhbnN3ZXJzLmRheXNGb3JTY2hlZHVsZSxcbiAgICAgICAgICAgIHNjaGVkdWxlU3RhcnRUaW1lOiBhbnN3ZXJzLnNjaGVkdWxlU3RhcnRUaW1lLFxuICAgICAgICAgICAgc2NoZWR1bGVTdG9wVGltZTogYW5zd2Vycy5zY2hlZHVsZVN0b3BUaW1lLFxuICAgICAgICAgICAgZW5hYmxlU2NoZWR1bGVFbmREYXRlOiBhbnN3ZXJzLmVuYWJsZVNjaGVkdWxlRW5kRGF0ZSxcbiAgICAgICAgICAgIHN0YXJ0U2NoZWR1bGVFbmREYXRlOiBhbnN3ZXJzLnN0YXJ0U2NoZWR1bGVFbmREYXRlLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgfSxcbiAgICByYWc6IHtcbiAgICAgIGVuYWJsZWQ6IGFuc3dlcnMuZW5hYmxlUmFnLFxuICAgICAgZW5naW5lczoge1xuICAgICAgICBhdXJvcmE6IHtcbiAgICAgICAgICBlbmFibGVkOiBhbnN3ZXJzLnJhZ3NUb0VuYWJsZS5pbmNsdWRlcyhcImF1cm9yYVwiKSxcbiAgICAgICAgfSxcbiAgICAgICAgb3BlbnNlYXJjaDoge1xuICAgICAgICAgIGVuYWJsZWQ6IGFuc3dlcnMucmFnc1RvRW5hYmxlLmluY2x1ZGVzKFwib3BlbnNlYXJjaFwiKSxcbiAgICAgICAgfSxcbiAgICAgICAga2VuZHJhOiB7XG4gICAgICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgY3JlYXRlSW5kZXg6IGZhbHNlLFxuICAgICAgICAgIGV4dGVybmFsOiBbe31dLFxuICAgICAgICAgIGVudGVycHJpc2U6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGVtYmVkZGluZ3NNb2RlbHM6IFt7fV0sXG4gICAgICBjcm9zc0VuY29kZXJNb2RlbHM6IFt7fV0sXG4gICAgfSxcbiAgfTtcblxuICAvLyBJZiB3ZSBoYXZlIG5vdCBlbmFibGVkIHJhZyB0aGUgZGVmYXVsdCBlbWJlZGRpbmcgaXMgc2V0IHRvIHRoZSBmaXJzdCBtb2RlbFxuICBpZiAoIWFuc3dlcnMuZW5hYmxlUmFnKSB7XG4gICAgbW9kZWxzLmRlZmF1bHRFbWJlZGRpbmcgPSBlbWJlZGRpbmdNb2RlbHNbMF0ubmFtZTtcbiAgfVxuXG4gIGNvbmZpZy5yYWcuY3Jvc3NFbmNvZGVyTW9kZWxzWzBdID0ge1xuICAgIHByb3ZpZGVyOiBcInNhZ2VtYWtlclwiLFxuICAgIG5hbWU6IFwiY3Jvc3MtZW5jb2Rlci9tcy1tYXJjby1NaW5pTE0tTC0xMi12MlwiLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gIH07XG4gIGNvbmZpZy5yYWcuZW1iZWRkaW5nc01vZGVscyA9IGVtYmVkZGluZ01vZGVscztcbiAgY29uZmlnLnJhZy5lbWJlZGRpbmdzTW9kZWxzLmZvckVhY2goKG06IGFueSkgPT4ge1xuICAgIGlmIChtLm5hbWUgPT09IG1vZGVscy5kZWZhdWx0RW1iZWRkaW5nKSB7XG4gICAgICBtLmRlZmF1bHQgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uZmlnLnJhZy5lbmdpbmVzLmtlbmRyYS5jcmVhdGVJbmRleCA9XG4gICAgYW5zd2Vycy5yYWdzVG9FbmFibGUuaW5jbHVkZXMoXCJrZW5kcmFcIik7XG4gIGNvbmZpZy5yYWcuZW5naW5lcy5rZW5kcmEuZW5hYmxlZCA9XG4gICAgY29uZmlnLnJhZy5lbmdpbmVzLmtlbmRyYS5jcmVhdGVJbmRleCB8fCBrZW5kcmFFeHRlcm5hbC5sZW5ndGggPiAwO1xuICBjb25maWcucmFnLmVuZ2luZXMua2VuZHJhLmV4dGVybmFsID0gWy4uLmtlbmRyYUV4dGVybmFsXTtcbiAgY29uZmlnLnJhZy5lbmdpbmVzLmtlbmRyYS5lbnRlcnByaXNlID0gYW5zd2Vycy5rZW5kcmFFbnRlcnByaXNlO1xuXG4gIGNvbnNvbGUubG9nKFwiXFxu4pyoIFRoaXMgaXMgdGhlIGNob3NlbiBjb25maWd1cmF0aW9uOlxcblwiKTtcbiAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoY29uZmlnLCB1bmRlZmluZWQsIDIpKTtcbiAgKFxuICAgIChhd2FpdCBlbnF1aXJlci5wcm9tcHQoW1xuICAgICAge1xuICAgICAgICB0eXBlOiBcImNvbmZpcm1cIixcbiAgICAgICAgbmFtZTogXCJjcmVhdGVcIixcbiAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICBcIkRvIHlvdSB3YW50IHRvIGNyZWF0ZS91cGRhdGUgdGhlIGNvbmZpZ3VyYXRpb24gYmFzZWQgb24gdGhlIGFib3ZlIHNldHRpbmdzXCIsXG4gICAgICAgIGluaXRpYWw6IHRydWUsXG4gICAgICB9LFxuICAgIF0pKSBhcyBhbnlcbiAgKS5jcmVhdGVcbiAgICA/IGNyZWF0ZUNvbmZpZyhjb25maWcpXG4gICAgOiBjb25zb2xlLmxvZyhcIlNraXBwaW5nXCIpO1xufVxuIl19