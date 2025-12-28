package com.moodcurator.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.moodcurator.app.data.api.RetrofitClient
import com.moodcurator.app.data.model.MoodInput
import com.moodcurator.app.data.model.MoodRequest
import com.moodcurator.app.data.model.Recommendation
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val currentResults: List<Recommendation>? = null,
    val history: List<MoodRequest> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class HomeViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadHistory()
    }

    fun createRecommendation(mood: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val response = RetrofitClient.apiService.createRecommendation(MoodInput(mood))
                if (response.isSuccessful) {
                    val recommendations = response.body()?.recommendations ?: emptyList()
                    _uiState.value = _uiState.value.copy(
                        currentResults = recommendations,
                        isLoading = false
                    )
                    loadHistory() // Refresh history
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = response.message() ?: "Failed to generate recommendations"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Network error occurred"
                )
            }
        }
    }

    fun loadHistory() {
        viewModelScope.launch {
            try {
                val response = RetrofitClient.apiService.getHistory()
                if (response.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        history = response.body() ?: emptyList()
                    )
                }
            } catch (e: Exception) {
                // Silently fail for history
            }
        }
    }

    fun selectHistoryItem(item: MoodRequest) {
        _uiState.value = _uiState.value.copy(currentResults = item.recommendations)
    }

    fun clearResults() {
        _uiState.value = _uiState.value.copy(currentResults = null)
    }
}






