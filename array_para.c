#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <time.h>

#define SIZE 10000000
#define NUM_THREADS 4

typedef struct {
    int *array;
    long long partial_sum;
    int start;
    int end;
} ThreadData;

// Fonction exécutée par chaque thread pour calculer la somme partielle
void* compute_partial_sum(void* arg) {
    ThreadData *data = (ThreadData*) arg;
    data->partial_sum = 0;
    for (int i = data->start; i < data->end; i++) {
        data->partial_sum += data->array[i];
    }
    pthread_exit(NULL);
}

int main() {
    // Allocation dynamique du tableau
    int *array = malloc(SIZE * sizeof(int));
    if (array == NULL) {
        fprintf(stderr, "Erreur d'allocation mémoire.\n");
        return 1;
    }

    // Initialisation du tableau avec des valeurs (par exemple, i)
    for (int i = 0; i < SIZE; i++) {
        array[i] = i;
    }

    pthread_t threads[NUM_THREADS];
    ThreadData thread_data[NUM_THREADS];
    int segment = SIZE / NUM_THREADS;

    clock_t start, end;
    double cpu_time_used;
    // Création des threads
    for (int i = 0; i < NUM_THREADS; i++) {
        thread_data[i].array = array;
        thread_data[i].start = i * segment;
        // Pour le dernier thread, s'assurer de couvrir tout le tableau
        thread_data[i].end = (i == NUM_THREADS - 1) ? SIZE : (i + 1) * segment;
        int rc = pthread_create(&threads[i], NULL, compute_partial_sum, (void*) &thread_data[i]);
        if (rc) {
            fprintf(stderr, "Erreur lors de la création du thread %d\n", i);
            free(array);
            return 1;
        }
    }

    // Attente de la terminaison des threads
    long long total_sum = 0;
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
        total_sum += thread_data[i].partial_sum;
    }
    // End timing
    end = clock();

    // Affichage du résultat
    printf("Somme des éléments du tableau (multithread) : %lld\n", total_sum);
    printf("Temps d'exécution (multithread) : %f secondes\n", (double)(end - start) / CLOCKS_PER_SEC);

    // Libération de la mémoire allouée
    free(array);

    return 0;
}