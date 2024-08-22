#include <stdio.h>

int main(void)
{
    int a;

    scanf("%d", &a);
    for (; a; a--)
    {
        for (int i = 0; i < a; i++)
            printf("*");
        printf("\n");
    }
    return 0;
}