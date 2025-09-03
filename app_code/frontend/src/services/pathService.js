import {api} from "./rest.js";

export const pathService = {
    async findShortestPath(source, destination) {
        try {
            const response = await api.get('/path', {
                params: {
                    source,
                    destination
                }
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error(error.response.data.error || 'Path not found');
            }
            throw new Error(`Failed to find path: ${error.response.data.error}`);
        }
    },

};