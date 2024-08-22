#include <stdio.h>

int main(void)
{
    int a;

    scanf("%d", &a);
    for (; a; a--)
    {
        for (int i = 0; i < a; i++)
            printf("*");
        if (a - 1 != 0)
            printf("\n");
    }
    return 0;
}