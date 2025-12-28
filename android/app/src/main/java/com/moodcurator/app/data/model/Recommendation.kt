package com.moodcurator.app.data.model

data class Recommendation(
    val title: String,
    val type: String, // "Movie", "TV Show", or "YouTube Video"
    val description: String,
    val reason: String
)

data class MoodRequest(
    val id: Int,
    val mood: String,
    val recommendations: List<Recommendation>,
    val createdAt: String?
)

data class RecommendationsResponse(
    val recommendations: List<Recommendation>
)

data class MoodInput(
    val mood: String
)






