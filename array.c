#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define SIZE 10000000

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
    
    clock_t start, end;
    double cpu_time_used;
    // Calcul de la somme
    long long sum = 0;

    // Start timing
    start = clock();

    for (int i = 0; i < SIZE; i++) {
        sum += array[i];
    }

    // End timing
    end = clock();

    // Affichage du résultat
    printf("Somme des éléments du tableau : %lld\n", sum);
    printf("Temps d'exécution : %f secondes\n", (double)(end - start) / CLOCKS_PER_SEC);

    // Libération de la mémoire allouée
    free(array);

    return 0;
}