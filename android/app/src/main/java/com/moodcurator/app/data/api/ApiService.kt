package com.moodcurator.app.data.api

import com.moodcurator.app.data.model.MoodInput
import com.moodcurator.app.data.model.MoodRequest
import com.moodcurator.app.data.model.RecommendationsResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {
    @POST("/api/recommendations")
    suspend fun createRecommendation(
        @Body input: MoodInput
    ): Response<RecommendationsResponse>

    @GET("/api/history")
    suspend fun getHistory(): Response<List<MoodRequest>>
}






