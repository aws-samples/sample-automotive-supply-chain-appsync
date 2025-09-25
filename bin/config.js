"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.getConfig = getConfig;
const types_1 = require("../lib/shared/types");
const fs_1 = require("fs");
function getConfig() {
    if ((0, fs_1.existsSync)("./bin/config.json")) {
        return JSON.parse((0, fs_1.readFileSync)("./bin/config.json").toString("utf8"));
    }
    // Default config
    return {
        prefix: "",
        /* vpc: {
           vpcId: "vpc-00000000000000000",
           createVpcEndpoints: true,
        },*/
        privateWebsite: false,
        certificate: "",
        cfGeoRestrictEnable: false,
        cfGeoRestrictList: [],
        bedrock: {
            enabled: true,
            region: types_1.SupportedRegion.US_EAST_1,
        },
        llms: {
            // sagemaker: [SupportedSageMakerModels.FalconLite]
            sagemaker: [],
        },
        rag: {
            enabled: false,
            engines: {
                aurora: {
                    enabled: false,
                },
                opensearch: {
                    enabled: false,
                },
                kendra: {
                    enabled: false,
                    createIndex: false,
                    enterprise: false,
                },
            },
            embeddingsModels: [
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
                    default: true,
                },
                {
                    provider: "openai",
                    name: "text-embedding-ada-002",
                    dimensions: 1536,
                },
            ],
            crossEncoderModels: [
                {
                    provider: "sagemaker",
                    name: "cross-encoder/ms-marco-MiniLM-L-12-v2",
                    default: true,
                },
            ],
        },
    };
}
exports.config = getConfig();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUdBLDhCQXNGQztBQXpGRCwrQ0FBb0U7QUFDcEUsMkJBQThDO0FBRTlDLFNBQWdCLFNBQVM7SUFDdkIsSUFBSSxJQUFBLGVBQVUsRUFBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7UUFDcEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUEsaUJBQVksRUFBQyxtQkFBbUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFDRCxpQkFBaUI7SUFDakIsT0FBTztRQUNMLE1BQU0sRUFBRSxFQUFFO1FBQ1Y7OztZQUdJO1FBQ0osY0FBYyxFQUFFLEtBQUs7UUFDckIsV0FBVyxFQUFFLEVBQUU7UUFDZixtQkFBbUIsRUFBRSxLQUFLO1FBQzFCLGlCQUFpQixFQUFFLEVBQUU7UUFDckIsT0FBTyxFQUFFO1lBQ1AsT0FBTyxFQUFFLElBQUk7WUFDYixNQUFNLEVBQUUsdUJBQWUsQ0FBQyxTQUFTO1NBQ2xDO1FBQ0QsSUFBSSxFQUFFO1lBQ0osbURBQW1EO1lBQ25ELFNBQVMsRUFBRSxFQUFFO1NBQ2Q7UUFDRCxHQUFHLEVBQUU7WUFDSCxPQUFPLEVBQUUsS0FBSztZQUNkLE9BQU8sRUFBRTtnQkFDUCxNQUFNLEVBQUU7b0JBQ04sT0FBTyxFQUFFLEtBQUs7aUJBQ2Y7Z0JBQ0QsVUFBVSxFQUFFO29CQUNWLE9BQU8sRUFBRSxLQUFLO2lCQUNmO2dCQUNELE1BQU0sRUFBRTtvQkFDTixPQUFPLEVBQUUsS0FBSztvQkFDZCxXQUFXLEVBQUUsS0FBSztvQkFDbEIsVUFBVSxFQUFFLEtBQUs7aUJBQ2xCO2FBQ0Y7WUFDRCxnQkFBZ0IsRUFBRTtnQkFDaEI7b0JBQ0UsUUFBUSxFQUFFLFdBQVc7b0JBQ3JCLElBQUksRUFBRSxnQ0FBZ0M7b0JBQ3RDLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjtnQkFDRDtvQkFDRSxRQUFRLEVBQUUsV0FBVztvQkFDckIsSUFBSSxFQUFFLHdDQUF3QztvQkFDOUMsVUFBVSxFQUFFLEdBQUc7aUJBQ2hCO2dCQUNEO29CQUNFLFFBQVEsRUFBRSxTQUFTO29CQUNuQixJQUFJLEVBQUUsNEJBQTRCO29CQUNsQyxVQUFVLEVBQUUsSUFBSTtpQkFDakI7Z0JBQ0QsK0VBQStFO2dCQUMvRTtvQkFDRSxRQUFRLEVBQUUsU0FBUztvQkFDbkIsSUFBSSxFQUFFLDZCQUE2QjtvQkFDbkMsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2dCQUNEO29CQUNFLFFBQVEsRUFBRSxTQUFTO29CQUNuQixJQUFJLEVBQUUseUJBQXlCO29CQUMvQixVQUFVLEVBQUUsSUFBSTtpQkFDakI7Z0JBQ0Q7b0JBQ0UsUUFBUSxFQUFFLFNBQVM7b0JBQ25CLElBQUksRUFBRSw4QkFBOEI7b0JBQ3BDLFVBQVUsRUFBRSxJQUFJO29CQUNoQixPQUFPLEVBQUUsSUFBSTtpQkFDZDtnQkFDRDtvQkFDRSxRQUFRLEVBQUUsUUFBUTtvQkFDbEIsSUFBSSxFQUFFLHdCQUF3QjtvQkFDOUIsVUFBVSxFQUFFLElBQUk7aUJBQ2pCO2FBQ0Y7WUFDRCxrQkFBa0IsRUFBRTtnQkFDbEI7b0JBQ0UsUUFBUSxFQUFFLFdBQVc7b0JBQ3JCLElBQUksRUFBRSx1Q0FBdUM7b0JBQzdDLE9BQU8sRUFBRSxJQUFJO2lCQUNkO2FBQ0Y7U0FDRjtLQUNGLENBQUM7QUFDSixDQUFDO0FBRVksUUFBQSxNQUFNLEdBQWlCLFNBQVMsRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3VwcG9ydGVkUmVnaW9uLCBTeXN0ZW1Db25maWcgfSBmcm9tIFwiLi4vbGliL3NoYXJlZC90eXBlc1wiO1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcmVhZEZpbGVTeW5jIH0gZnJvbSBcImZzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25maWcoKTogU3lzdGVtQ29uZmlnIHtcbiAgaWYgKGV4aXN0c1N5bmMoXCIuL2Jpbi9jb25maWcuanNvblwiKSkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhcIi4vYmluL2NvbmZpZy5qc29uXCIpLnRvU3RyaW5nKFwidXRmOFwiKSk7XG4gIH1cbiAgLy8gRGVmYXVsdCBjb25maWdcbiAgcmV0dXJuIHtcbiAgICBwcmVmaXg6IFwiXCIsXG4gICAgLyogdnBjOiB7XG4gICAgICAgdnBjSWQ6IFwidnBjLTAwMDAwMDAwMDAwMDAwMDAwXCIsXG4gICAgICAgY3JlYXRlVnBjRW5kcG9pbnRzOiB0cnVlLFxuICAgIH0sKi9cbiAgICBwcml2YXRlV2Vic2l0ZTogZmFsc2UsXG4gICAgY2VydGlmaWNhdGU6IFwiXCIsXG4gICAgY2ZHZW9SZXN0cmljdEVuYWJsZTogZmFsc2UsXG4gICAgY2ZHZW9SZXN0cmljdExpc3Q6IFtdLFxuICAgIGJlZHJvY2s6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICByZWdpb246IFN1cHBvcnRlZFJlZ2lvbi5VU19FQVNUXzEsXG4gICAgfSxcbiAgICBsbG1zOiB7XG4gICAgICAvLyBzYWdlbWFrZXI6IFtTdXBwb3J0ZWRTYWdlTWFrZXJNb2RlbHMuRmFsY29uTGl0ZV1cbiAgICAgIHNhZ2VtYWtlcjogW10sXG4gICAgfSxcbiAgICByYWc6IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgZW5naW5lczoge1xuICAgICAgICBhdXJvcmE6IHtcbiAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgb3BlbnNlYXJjaDoge1xuICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBrZW5kcmE6IHtcbiAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICBjcmVhdGVJbmRleDogZmFsc2UsXG4gICAgICAgICAgZW50ZXJwcmlzZTogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgZW1iZWRkaW5nc01vZGVsczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZXI6IFwic2FnZW1ha2VyXCIsXG4gICAgICAgICAgbmFtZTogXCJpbnRmbG9hdC9tdWx0aWxpbmd1YWwtZTUtbGFyZ2VcIixcbiAgICAgICAgICBkaW1lbnNpb25zOiAxMDI0LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZXI6IFwic2FnZW1ha2VyXCIsXG4gICAgICAgICAgbmFtZTogXCJzZW50ZW5jZS10cmFuc2Zvcm1lcnMvYWxsLU1pbmlMTS1MNi12MlwiLFxuICAgICAgICAgIGRpbWVuc2lvbnM6IDM4NCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGVyOiBcImJlZHJvY2tcIixcbiAgICAgICAgICBuYW1lOiBcImFtYXpvbi50aXRhbi1lbWJlZC10ZXh0LXYxXCIsXG4gICAgICAgICAgZGltZW5zaW9uczogMTUzNixcbiAgICAgICAgfSxcbiAgICAgICAgLy9TdXBwb3J0IGZvciBpbnB1dEltYWdlIGlzIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIGFtYXpvbi50aXRhbi1lbWJlZC1pbWFnZS12MVxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZXI6IFwiYmVkcm9ja1wiLFxuICAgICAgICAgIG5hbWU6IFwiYW1hem9uLnRpdGFuLWVtYmVkLWltYWdlLXYxXCIsXG4gICAgICAgICAgZGltZW5zaW9uczogMTAyNCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGVyOiBcImJlZHJvY2tcIixcbiAgICAgICAgICBuYW1lOiBcImNvaGVyZS5lbWJlZC1lbmdsaXNoLXYzXCIsXG4gICAgICAgICAgZGltZW5zaW9uczogMTAyNCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGVyOiBcImJlZHJvY2tcIixcbiAgICAgICAgICBuYW1lOiBcImNvaGVyZS5lbWJlZC1tdWx0aWxpbmd1YWwtdjNcIixcbiAgICAgICAgICBkaW1lbnNpb25zOiAxMDI0LFxuICAgICAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlcjogXCJvcGVuYWlcIixcbiAgICAgICAgICBuYW1lOiBcInRleHQtZW1iZWRkaW5nLWFkYS0wMDJcIixcbiAgICAgICAgICBkaW1lbnNpb25zOiAxNTM2LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGNyb3NzRW5jb2Rlck1vZGVsczogW1xuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZXI6IFwic2FnZW1ha2VyXCIsXG4gICAgICAgICAgbmFtZTogXCJjcm9zcy1lbmNvZGVyL21zLW1hcmNvLU1pbmlMTS1MLTEyLXYyXCIsXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpZzogU3lzdGVtQ29uZmlnID0gZ2V0Q29uZmlnKCk7XG4iXX0=