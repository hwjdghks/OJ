#include <stdio.h>

int main(void)
{
    int *ptr = NULL;
    *ptr = 10; // NULL 포인터에 접근하여 런타임 에러 발생
    
    return 0;
}
