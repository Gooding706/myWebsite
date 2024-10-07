#include <sys/types.h>
#include <dirent.h>
#include <stdlib.h>
#include <stdio.h>

#include <string.h>

#define initStack(st)           \
    {                           \
        st.sp = st.stackMemory; \
    }
#define stackIsEmpty(st) (st.sp == st.stackMemory)
#define freeNamedDirectory(nd)  \
    {                           \
        free(nd.path);          \
        closedir(nd.directory); \
    }

typedef struct
{
    DIR *directory;
    char *path;
    uint8_t readFlag;
} namedDirectory;

typedef struct
{
    namedDirectory *sp;
    namedDirectory stackMemory[256];
} directoryStack;

namedDirectory popStack(directoryStack *stk)
{
    stk->sp--;
    return *(stk->sp);
}

void stripExtension(char* fileName, size_t length)
{
    for(int i = length-1; i >= 0; i--)
    {
        if(*(fileName + i) == '.')
        {
            *(fileName + i) = '\0';
            return;
        }
    }
}

void pushStack(directoryStack *stk, namedDirectory directory)
{
    *(stk->sp) = directory;
    if (stk->sp == stk->stackMemory + 256)
    {
        printf("Stack Overflow!!\n");
    }
    stk->sp++;
}

char *appendPathString(char *basePath, char *other)
{
    size_t basePathlength = strlen(basePath);
    size_t otherLength = strlen(other);
    char *out = malloc(sizeof(char) * (basePathlength + otherLength + 2));

    memcpy(out, basePath, basePathlength);
    memcpy(out + (sizeof(char) * basePathlength), other, otherLength);

    char *end = (out + sizeof(char) * (basePathlength + otherLength));
    *end = '/';
    *(end + 1) = '\0';

    return out;
}

int main()
{
    FILE *writeFile = fopen("./fileData.js", "w");
    fprintf(writeFile, "const dirs = {\"root\":{\"name\":\"~\",\"content\":[");
    directoryStack stack;
    initStack(stack);

    namedDirectory directory;

    namedDirectory root = {opendir("./root/"), "./root/", 0};
    pushStack(&stack, root);

    while (!stackIsEmpty(stack))
    {
        directory = popStack(&stack);
        struct dirent *workingEntry;
        workingEntry = readdir(directory.directory);

        while (workingEntry != NULL)
        {

            // ignore files/directories with period prefix
            if (workingEntry->d_name[0] == '.')
            {
                workingEntry = readdir(directory.directory);
                continue;
            }

            if (workingEntry->d_type == DT_REG)
            {
                // char *filePath = appendPathString(directory.path, workingEntry->d_name);
                if (directory.readFlag == 1)
                {
                    fprintf(writeFile, ",");
                }
                else
                {
                    directory.readFlag = 1;
                }

                size_t nameLen = strlen( workingEntry->d_name);
                char * modified = malloc(nameLen);
                memcpy(modified, workingEntry->d_name, nameLen);
                stripExtension(modified, nameLen);

                fprintf(writeFile, "{\"name\":\"%s\",\"link\":\"%s%s\"}", modified, directory.path, workingEntry->d_name);
                // printf("%s\n", filePath);
                // free(filePath);
            }
            else if (workingEntry->d_type == DT_DIR)
            {
                if (directory.readFlag == 1)
                {
                    fprintf(writeFile, ",");
                }
                else
                {
                    directory.readFlag = 1;
                }

                pushStack(&stack, directory);
       
                
                char *newPath = appendPathString(directory.path, workingEntry->d_name);

                printf("%s\n", newPath);

                namedDirectory newDirectory = {opendir(newPath), newPath, 0};

                pushStack(&stack, newDirectory);


            
                fprintf(writeFile, "{\"name\":\"%s\",\"content\":[", workingEntry->d_name);

                break;
            }

            workingEntry = readdir(directory.directory);
        }

        if (workingEntry == NULL && !stackIsEmpty(stack))
        {
            fprintf(writeFile, "]}");
            freeNamedDirectory(directory);
        }
    }
    fprintf(writeFile, "]}}");
    fclose(writeFile);
    closedir(root.directory);

    return 0;
}